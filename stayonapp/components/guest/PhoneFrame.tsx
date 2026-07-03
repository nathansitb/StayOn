"use client";

import type { ReactNode } from "react";

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative w-[390px] max-w-[calc(100vw-32px)] h-[800px] max-h-[calc(100vh-160px)] bg-bg rounded-[30px] overflow-hidden"
      style={{
        border: "1px solid var(--line-strong)",
        boxShadow: "0 30px 80px rgba(0,0,0,.55), inset 0 0 0 7px #060606",
      }}
    >
      <div className="absolute top-[14px] left-1/2 -translate-x-1/2 w-[120px] h-[26px] bg-black rounded-[20px] z-40" />
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
      className="absolute top-[56px] left-[22px] z-30 w-10 h-10 rounded-full flex items-center justify-center text-[18px] text-cream"
      style={{
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
