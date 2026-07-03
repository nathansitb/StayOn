export function ProgressDots({ step, total = 4 }: { step: number; total?: number }) {
  return (
    <div className="flex gap-1.5 justify-center mt-[18px]">
      {Array.from({ length: total }).map((_, i) => {
        const on = i + 1 <= step;
        return (
          <i
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              on ? "bg-gold w-[18px]" : "w-1.5"
            }`}
            style={on ? {} : { background: "var(--line-strong)" }}
          />
        );
      })}
    </div>
  );
}
