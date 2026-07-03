"use client";

/** <img> with a graceful gradient fallback if the remote photo fails. */
export function Photo({
  src,
  alt = "",
  className = "",
}: {
  src: string;
  alt?: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={(e) => {
        (e.currentTarget as HTMLImageElement).style.opacity = "0.001";
      }}
      className={className}
      style={{ background: "linear-gradient(135deg,#2a2723,#171512)" }}
    />
  );
}
