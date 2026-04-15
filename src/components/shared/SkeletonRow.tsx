interface SkeletonRowProps {
  /** Número de células <td> a renderizar. Padrão: 6. */
  cols?: number;
}

export function SkeletonRow({ cols = 6 }: SkeletonRowProps) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}
