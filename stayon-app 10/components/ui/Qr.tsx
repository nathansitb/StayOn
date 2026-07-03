/**
 * Deterministic decorative "QR" mark for the demo (not a scannable code).
 * Same seed → same pattern, so each apartment gets a stable unique glyph.
 */
export function Qr({ seed, className = "" }: { seed: number; className?: string }) {
  let r = seed * 9301 + 49297;
  const rand = () => {
    r = (r * 9301 + 49297) % 233280;
    return r / 233280;
  };
  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      const corner =
        (x < 3 && y < 3) || (x > 5 && y < 3) || (x < 3 && y > 5);
      const on = corner
        ? x === 0 || x === 2 || x === 6 || x === 8 || y === 0 || y === 2 || y === 6 || y === 8
        : rand() > 0.5;
      if (on) cells.push({ x, y });
    }
  }
  return (
    <svg viewBox="0 0 9 9" fill="#111" className={className}>
      {cells.map((c, i) => (
        <rect key={i} x={c.x} y={c.y} width={1} height={1} />
      ))}
    </svg>
  );
}
