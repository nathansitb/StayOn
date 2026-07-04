"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

function slug(s: string) {
  return s.trim().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "") || "apartment";
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A real, scannable QR for an apartment link, with PNG + printable-plaque download. */
export function QrCode({ value, apartmentName }: { value: string; apartmentName: string }) {
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!value) return;
    QRCode.toDataURL(value, {
      margin: 1,
      width: 400,
      errorCorrectionLevel: "M",
      color: { dark: "#0B0B0B", light: "#F3EDE1" },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(""));
  }, [value]);

  function downloadQr() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `StayOn-QR-${slug(apartmentName)}.png`;
    a.click();
  }

  function downloadPlaque() {
    if (!dataUrl) return;
    const c = document.createElement("canvas");
    c.width = 600;
    c.height = 800;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0B0B0B";
    ctx.fillRect(0, 0, 600, 800);
    ctx.textAlign = "center";

    ctx.fillStyle = "#F3EDE1";
    ctx.font = "600 62px Georgia, 'Times New Roman', serif";
    ctx.fillText("StayOn", 300, 175);
    ctx.fillStyle = "#C9C2B4";
    ctx.font = "italic 23px Georgia, serif";
    ctx.fillText("Extend the moment. In style.", 300, 214);

    const img = new Image();
    img.onload = () => {
      ctx.fillStyle = "#F3EDE1";
      roundRect(ctx, 150, 280, 300, 300, 10);
      ctx.fill();
      ctx.drawImage(img, 170, 300, 260, 260);

      ctx.fillStyle = "#F3EDE1";
      ctx.font = "600 30px Georgia, serif";
      ctx.fillText(apartmentName, 300, 648);
      ctx.fillStyle = "#8B857A";
      ctx.font = "17px Arial, sans-serif";
      ctx.fillText("SCAN TO STAY ONE MORE NIGHT", 300, 690);

      const url = c.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `StayOn-plaque-${slug(apartmentName)}.png`;
      a.click();
    };
    img.src = dataUrl;
  }

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      <div className="w-[84px] h-[84px] bg-[#F3EDE1] rounded-[3px] p-1.5 flex items-center justify-center">
        {dataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dataUrl} alt="QR" className="w-full h-full" />
        ) : (
          <div className="w-full h-full animate-pulse bg-[#e6e0d2] rounded-[2px]" />
        )}
      </div>
      <div className="flex gap-1.5">
        <button
          onClick={downloadQr}
          className="px-2.5 py-1 rounded-[2px] border border-line text-[9px] uppercase tracking-[.8px] text-muted hover:text-cream transition"
        >
          QR
        </button>
        <button
          onClick={downloadPlaque}
          className="px-2.5 py-1 rounded-[2px] border border-line text-[9px] uppercase tracking-[.8px] text-muted hover:text-cream transition"
        >
          Plaque
        </button>
      </div>
    </div>
  );
}
