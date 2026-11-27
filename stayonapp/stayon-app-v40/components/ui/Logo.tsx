interface LogoProps {
  /** font-size of the "StayOn" wordmark in px */
  size?: number;
  tagline?: boolean;
  className?: string;
}

/**
 * StayOn brand lockup, recreated as vector art:
 * the "StayOn" wordmark (app serif) with the rising, curved growth arrow
 * sweeping up from the word into an arrowhead, and the optional tagline.
 * Colors inherit from `currentColor`, so it works on any dark surface.
 */
export function Logo({ size = 40, tagline = false, className = "" }: LogoProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        lineHeight: 1,
        color: "currentColor",
      }}
    >
      <span style={{ position: "relative", display: "inline-block" }}>
        <svg
          aria-hidden="true"
          viewBox="0 0 120 40"
          style={{
            position: "absolute",
            left: size * 0.52,
            top: -size * 0.62,
            width: size * 1.9,
            height: "auto",
            overflow: "visible",
          }}
        >
          <path
            d="M4,36 C 34,33 58,26 96,6"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.1"
            strokeLinecap="round"
          />
          <path
            d="M96,6 L82,5 M96,6 L94,20"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span
          className="font-serif"
          style={{
            fontSize: size,
            fontWeight: 600,
            letterSpacing: "0.5px",
            display: "inline-block",
          }}
        >
          StayOn
        </span>
      </span>
      {tagline && (
        <span
          className="font-serif"
          style={{
            fontStyle: "italic",
            fontSize: size * 0.33,
            marginTop: size * 0.14,
            opacity: 0.72,
            letterSpacing: "0.3px",
          }}
        >
          Extend the moment. In style.
        </span>
      )}
    </span>
  );
}
