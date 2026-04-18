import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import type { BotFlowState, Menu } from "../types";
import { MenuNodeCustom } from "./MenuNodeCustom";
import { FlowEdgeRenderer } from "./FlowEdgeRenderer";

interface FlowNode {
  id: string;
  menu: Menu;
  x: number;
  y: number;
}

interface DragState {
  nodeId: string | null;
  offsetX: number;
  offsetY: number;
}

interface ConnectingState {
  sourceNodeId: string;
  sourceOptionIdx: number;
}

interface FlowCanvasProps {
  flowState: BotFlowState;
  onUpdate: (flowState: BotFlowState) => void;
}

export function FlowCanvas({ flowState, onUpdate }: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [nodes, setNodes] = useState<FlowNode[]>(() =>
    flowState.menus.map((menu, idx) => ({
      id: menu.ref,
      menu,
      x: idx * 420,
      y: Math.floor(idx / 3) * 280,
    }))
  );

  const [dragState, setDragState] = useState<DragState>({
    nodeId: null,
    offsetX: 0,
    offsetY: 0,
  });

  const [connectingState, setConnectingState] =
    useState<ConnectingState | null>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  // Atualizar fluxo quando nós mudam
  useEffect(() => {
    onUpdate({
      ...flowState,
      menus: nodes.map((node) => node.menu),
    });
  }, [nodes, flowState, onUpdate]);

  const handleNodeMouseDown = (nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const offsetX = e.clientX - rect.left - node.x * zoom - panOffset.x;
    const offsetY = e.clientY - rect.top - node.y * zoom - panOffset.y;

    setDragState({ nodeId, offsetX, offsetY });
    setSelectedNodeId(nodeId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragState.nodeId && e.buttons === 1) {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left - panOffset.x - dragState.offsetX) / zoom;
      const y = (e.clientY - rect.top - panOffset.y - dragState.offsetY) / zoom;

      setNodes((prev) =>
        prev.map((node) =>
          node.id === dragState.nodeId ? { ...node, x, y } : node
        )
      );
    }
  };

  const handleMouseUp = () => {
    setDragState({ nodeId: null, offsetX: 0, offsetY: 0 });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      // Right click for pan
      const canvas = canvasRef.current;
      if (!canvas) return;
      const startX = e.clientX;
      const startY = e.clientY;
      const startPan = { ...panOffset };

      const handleMouseMove = (moveE: MouseEvent) => {
        const deltaX = moveE.clientX - startX;
        const deltaY = moveE.clientY - startY;
        setPanOffset({
          x: startPan.x + deltaX,
          y: startPan.y + deltaY,
        });
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const newZoom = Math.max(0.1, Math.min(3, zoom - e.deltaY * 0.001));
    setZoom(newZoom);
  };

  const handleAddNode = () => {
    const newRef = `MENU_${Date.now()}`;
    const newMenu: Menu = {
      ref: newRef,
      question: "Nova pergunta?",
      options: [],
    };
    const maxY = Math.max(0, ...nodes.map((n) => n.y));
    setNodes([...nodes, { id: newRef, menu: newMenu, x: 0, y: maxY + 280 }]);
  };

  const handleDeleteNode = (nodeId: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== nodeId));
    setConnectingState(null);
  };

  const handleDuplicateNode = (nodeId: string) => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const newRef = `MENU_${Date.now()}`;
    const newMenu: Menu = {
      ...node.menu,
      ref: newRef,
      options: node.menu.options.map((opt) => ({ ...opt })),
    };

    setNodes([
      ...nodes,
      {
        id: newRef,
        menu: newMenu,
        x: node.x + 440,
        y: node.y,
      },
    ]);
  };

  const handleUpdateMenu = (updatedMenu: Menu) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === updatedMenu.ref ? { ...n, menu: updatedMenu } : n
      )
    );
  };

  const handleStartConnection = (optionIdx: number, nodeId: string) => {
    setConnectingState({ sourceNodeId: nodeId, sourceOptionIdx: optionIdx });
  };

  const handleCompleteConnection = (targetNodeId: string) => {
    if (!connectingState || connectingState.sourceNodeId === targetNodeId)
      return;

    const sourceNode = nodes.find((n) => n.id === connectingState.sourceNodeId);
    if (!sourceNode) return;

    const updatedMenu = { ...sourceNode.menu };
    updatedMenu.options[connectingState.sourceOptionIdx].nextMenuRef =
      targetNodeId;

    setNodes((prev) =>
      prev.map((n) =>
        n.id === sourceNode.menu.ref ? { ...n, menu: updatedMenu } : n
      )
    );

    setConnectingState(null);
  };

  const handleCancelConnection = () => {
    setConnectingState(null);
  };

  return (
    <div
      ref={canvasRef}
      className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseDown={handleCanvasMouseDown}
      onContextMenu={(e) => e.preventDefault()}
      onWheel={handleWheel}
      style={{ cursor: dragState.nodeId ? "grabbing" : "grab" }}
    >
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 shadow-lg">
        <button
          onClick={handleAddNode}
          className="flex items-center gap-1.5 px-3 py-2 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          title="Adicionar novo diálogo (Ctrl+N)"
        >
          <Plus size={14} />
          Novo diálogo
        </button>
      </div>

      {/* Info */}
      <div className="absolute bottom-4 left-4 z-20 text-xs text-slate-500 dark:text-slate-400">
        <div>🖱️ Arrastar para mover nós</div>
        <div>🖱️ Clique direito para pan</div>
        <div>🔍 Scroll para zoom</div>
        {connectingState && (
          <div className="mt-2 text-orange-600 dark:text-orange-400">
            Clique em outro diálogo para conectar (ESC para cancelar)
          </div>
        )}
      </div>

      {/* Canvas Content */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={canvasRef.current?.clientWidth}
        height={canvasRef.current?.clientHeight}
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" className="fill-slate-400" />
          </marker>
          <marker
            id="arrowhead-connecting"
            markerWidth="10"
            markerHeight="10"
            refX="9"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 10 3, 0 6" className="fill-orange-500" />
          </marker>
        </defs>

        {/* Edges */}
        <FlowEdgeRenderer
          nodes={nodes}
          panOffset={panOffset}
          zoom={zoom}
        />

        {/* Connecting line preview */}
        {connectingState && (
          <line
            x1={
              (nodes.find((n) => n.id === connectingState.sourceNodeId)?.x ??
                0) *
                zoom +
              panOffset.x +
              380
            }
            y1={
              (nodes.find((n) => n.id === connectingState.sourceNodeId)?.y ??
                0) *
                zoom +
              panOffset.y +
              100
            }
            x2={canvasRef.current?.clientWidth ?? 0}
            y2={canvasRef.current?.clientHeight ?? 0}
            className="stroke-orange-500 stroke-2 pointer-events-none"
            strokeDasharray="5,5"
            markerEnd="url(#arrowhead-connecting)"
          />
        )}
      </svg>

      {/* Nodes */}
      <div className="absolute inset-0 pointer-events-none">
        {nodes.map((node) => (
          <div
            key={node.id}
            style={{
              transform: `translate(${node.x * zoom + panOffset.x}px, ${node.y * zoom + panOffset.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              pointerEvents: "auto",
            }}
          >
            <MenuNodeCustom
              menu={node.menu}
              isSelected={selectedNodeId === node.id}
              isConnecting={connectingState?.sourceNodeId === node.id}
              onMouseDown={(e) => handleNodeMouseDown(node.id, e)}
              onUpdate={handleUpdateMenu}
              onDelete={() => handleDeleteNode(node.id)}
              onDuplicate={() => handleDuplicateNode(node.id)}
              onStartConnection={handleStartConnection}
              onCompleteConnection={() => handleCompleteConnection(node.id)}
              onCancelConnection={handleCancelConnection}
            />
          </div>
        ))}
      </div>

      {/* Keyboard shortcuts */}
      <div
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setConnectingState(null);
            setSelectedNodeId(null);
          }
          if (e.ctrlKey && e.key === "n") {
            e.preventDefault();
            handleAddNode();
          }
        }}
        tabIndex={-1}
      />
    </div>
  );
}
