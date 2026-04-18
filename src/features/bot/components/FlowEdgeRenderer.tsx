import type { Menu } from "../types";

interface FlowNode {
  id: string;
  menu: Menu;
  x: number;
  y: number;
}

interface FlowEdgeRendererProps {
  nodes: FlowNode[];
  panOffset: { x: number; y: number };
  zoom: number;
}

export function FlowEdgeRenderer({
  nodes,
  panOffset,
  zoom,
}: FlowEdgeRendererProps) {
  // Calcular posição do ponto de conexão (meio direito da caixa)
  const getConnectionPoint = (node: FlowNode) => {
    const nodeWidth = 320; // w-80 = 20rem
    const nodeHeight = 200; // aproximado
    return {
      x: node.x * zoom + panOffset.x + nodeWidth * zoom,
      y: node.y * zoom + panOffset.y + nodeHeight * zoom / 2,
    };
  };

  // Calcular posição do ponto de entrada (meio esquerdo da caixa)
  const getEntryPoint = (node: FlowNode) => {
    return {
      x: node.x * zoom + panOffset.x,
      y: node.y * zoom + panOffset.y + (200 * zoom) / 2,
    };
  };

  // Desenhar linha com curva Bezier
  const drawEdgePath = (
    fromX: number,
    fromY: number,
    toX: number,
    toY: number
  ) => {
    const distance = Math.abs(toX - fromX);
    const controlPointDistance = Math.max(50, distance / 2);

    return `M ${fromX} ${fromY} C ${fromX + controlPointDistance} ${fromY}, ${toX - controlPointDistance} ${toY}, ${toX} ${toY}`;
  };

  return (
    <>
      {nodes.map((node) => {
        // Desenhar edges de saída
        return node.menu.options
          .map((option, optIdx) => {
            if (!option.nextMenuRef) return null;

            const targetNode = nodes.find((n) => n.id === option.nextMenuRef);
            if (!targetNode) return null;

            const fromPoint = getConnectionPoint(node);
            const toPoint = getEntryPoint(targetNode);

            return (
              <path
                key={`edge-${node.id}-${optIdx}`}
                d={drawEdgePath(fromPoint.x, fromPoint.y, toPoint.x, toPoint.y)}
                className="stroke-slate-300 dark:stroke-slate-600 stroke-2 fill-none pointer-events-none"
                strokeLinecap="round"
                markerEnd="url(#arrowhead)"
              />
            );
          })
          .filter(Boolean);
      })}
    </>
  );
}
