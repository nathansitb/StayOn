"use client";

import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="
        relative bg-bg overflow-hidden
        w-full min-h-[100dvh] rounded-none
        sm:w-[390px] sm:max-w-[calc(100vw-32px)] sm:min-h-0 sm:h-[800px] sm:max-h-[calc(100vh-160px)] sm:rounded-[30px]
        sm:border sm:border-[color:var(--line-strong)]
        sm:shadow-[0_30px_80px_rgba(0,0,0,.55),inset_0_0_0_7px_#060606]
      "
    >
      {/* Fake notch only on the desktop mockup */}
      <div className="hidden sm:block absolute top-[14px] left-1/2 -translate-x-1/2 w-[120px] h-[26px] bg-black rounded-[20px] z-40" />
      <div className="absolute inset-0 overflow-y-auto overflow-x-hidden no-scrollbar">
        {children}
      </div>
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute left-[18px] sm:left-[22px] z-30 w-10 h-10 rounded-full flex items-center justify-center text-[18px] text-cream"
      style={{
        top: "max(env(safe-area-inset-top, 0px), 18px)",
        background: "rgba(20,19,17,.7)",
        backdropFilter: "blur(8px)",
        border: "1px solid var(--line)",
      }}
      aria-label="Back"
    >
      ‹
    </button>
  );
}
