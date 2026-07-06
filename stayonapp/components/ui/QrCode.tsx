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

/** Draw the StayOn rising arrow above the wordmark. */
function drawArrow(ctx: CanvasRenderingContext2D, cx: number, topY: number, cream: string) {
  ctx.strokeStyle = cream;
  ctx.lineWidth = 12;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 78, topY + 92);
  ctx.bezierCurveTo(cx - 6, topY + 78, cx + 44, topY + 44, cx + 96, topY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 96, topY);
  ctx.lineTo(cx + 60, topY + 2);
  ctx.moveTo(cx + 96, topY);
  ctx.lineTo(cx + 94, topY + 40);
  ctx.stroke();
}

/** Real, scannable QR for an apartment link, with PNG + example-style plaque. */
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

  async function downloadPlaque() {
    const cream = "#F3EDE1";
    const black = "#0B0B0B";

    // High error-correction QR so the centre emblem never breaks scanning.
    const qrUrl = await QRCode.toDataURL(value, {
      margin: 1,
      width: 600,
      errorCorrectionLevel: "H",
      color: { dark: black, light: cream },
    });

    // Make sure Cormorant is ready before drawing text.
    try {
      const f = (document as unknown as { fonts?: FontFaceSet }).fonts;
      if (f) {
        await Promise.all([
          f.load('600 92px "Cormorant Garamond"'),
          f.load('500 30px "Cormorant Garamond"'),
          f.load('italic 30px "Cormorant Garamond"'),
        ]).catch(() => {});
        await f.ready;
      }
    } catch {
      /* ignore */
    }

    const W = 720;
    const H = 1020;
    const cx = W / 2;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = black;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = cream;

    // rising arrow
    drawArrow(ctx, cx, 190, cream);

    // wordmark
    ctx.font = '600 96px "Cormorant Garamond", Georgia, serif';
    ctx.fillText("StayOn", cx, 430);

    // tagline
    ctx.font = '500 30px "Cormorant Garamond", Georgia, serif';
    ctx.fillStyle = "#C9C2B4";
    ctx.fillText("Extend the moment. In style.", cx, 486);

    // QR
    const qrImg = new Image();
    qrImg.onload = () => {
      const qrSize = 300;
      const qx = cx - qrSize / 2;
      const qy = 560;
      // cream card behind
      ctx.fillStyle = cream;
      roundRect(ctx, qx - 14, qy - 14, qrSize + 28, qrSize + 28, 10);
      ctx.fill();
      ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);

      // centre emblem
      const eSize = 58;
      const ex = cx - eSize / 2;
      const ey = qy + qrSize / 2 - eSize / 2;
      ctx.fillStyle = black;
      roundRect(ctx, ex, ey, eSize, eSize, 8);
      ctx.fill();
      // mini arrow inside emblem
      ctx.strokeStyle = cream;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ex + 15, ey + 40);
      ctx.bezierCurveTo(ex + 26, ey + 36, ex + 34, ey + 28, ex + 42, ey + 17);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(ex + 42, ey + 17);
      ctx.lineTo(ex + 31, ey + 18);
      ctx.moveTo(ex + 42, ey + 17);
      ctx.lineTo(ex + 42, ey + 28);
      ctx.stroke();

      // caption: "Tap here to" (here italic) / "stay one more night"
      ctx.fillStyle = cream;
      const line1Y = 940;
      const line2Y = 986;
      const parts: [string, boolean][] = [
        ["Tap ", false],
        ["here", true],
        [" to", false],
      ];
      ctx.textAlign = "left";
      const font = (it: boolean) =>
        `${it ? "italic " : ""}500 34px "Cormorant Garamond", Georgia, serif`;
      let total = 0;
      for (const [t, it] of parts) {
        ctx.font = font(it);
        total += ctx.measureText(t).width;
      }
      let sx = cx - total / 2;
      for (const [t, it] of parts) {
        ctx.font = font(it);
        ctx.fillText(t, sx, line1Y);
        sx += ctx.measureText(t).width;
      }
      ctx.textAlign = "center";
      ctx.font = '500 34px "Cormorant Garamond", Georgia, serif';
      ctx.fillText("stay one more night", cx, line2Y);

      const url = c.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `StayOn-plaque-${slug(apartmentName)}.png`;
      a.click();
    };
    qrImg.src = qrUrl;
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
        <button onClick={downloadQr} className="px-2.5 py-1 rounded-[2px] border border-line text-[9px] uppercase tracking-[.8px] text-muted hover:text-cream transition">
          QR
        </button>
        <button onClick={downloadPlaque} className="px-2.5 py-1 rounded-[2px] border border-line text-[9px] uppercase tracking-[.8px] text-muted hover:text-cream transition">
          Plaque
        </button>
      </div>
    </div>
  );
}
