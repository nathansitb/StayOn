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

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });
}

/** Find the bounding box of the visible logo (strips black / transparent padding). */
function contentBounds(img: HTMLImageElement): { sx: number; sy: number; sw: number; sh: number } {
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const full = { sx: 0, sy: 0, sw: w, sh: h };
  const oc = document.createElement("canvas");
  oc.width = w;
  oc.height = h;
  const octx = oc.getContext("2d");
  if (!octx) return full;
  octx.drawImage(img, 0, 0);
  let data: Uint8ClampedArray;
  try {
    data = octx.getImageData(0, 0, w, h).data;
  } catch {
    return full;
  }
  let minX = w, minY = h, maxX = 0, maxY = 0, found = false;
  const step = Math.max(1, Math.floor(Math.min(w, h) / 500));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = (y * w + x) * 4;
      const a = data[i + 3];
      const lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
      if (a > 20 && lum > 45) {
        found = true;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (!found) return full;
  const pad = Math.round(Math.min(w, h) * 0.02);
  minX = Math.max(0, minX - pad);
  minY = Math.max(0, minY - pad);
  maxX = Math.min(w, maxX + pad);
  maxY = Math.min(h, maxY + pad);
  return { sx: minX, sy: minY, sw: maxX - minX, sh: maxY - minY };
}

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

    const qrUrl = await QRCode.toDataURL(value, {
      margin: 1,
      width: 600,
      errorCorrectionLevel: "H",
      color: { dark: black, light: cream },
    });
    const qrImg = await loadImage(qrUrl);
    const logo = await loadImage("/logo.png").catch(() => null);

    // Cormorant for the caption fallback / text
    try {
      const f = (document as unknown as { fonts?: FontFaceSet }).fonts;
      if (f) {
        await Promise.all([
          f.load('500 34px "Cormorant Garamond"'),
          f.load('italic 34px "Cormorant Garamond"'),
        ]).catch(() => {});
        await f.ready;
      }
    } catch {
      /* ignore */
    }

    const W = 720;
    const H = 1080;
    const cx = W / 2;
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = black;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";

    // ---- logo (real image, auto-cropped) or text fallback ----
    let qy: number;
    if (logo) {
      const b = contentBounds(logo);
      const targetW = 520;
      const dh = Math.round(targetW * (b.sh / b.sw));
      const ly = 70;
      ctx.drawImage(logo, b.sx, b.sy, b.sw, b.sh, cx - targetW / 2, ly, targetW, dh);
      qy = ly + dh + 54;
    } else {
      ctx.fillStyle = cream;
      ctx.font = '600 96px "Cormorant Garamond", Georgia, serif';
      ctx.fillText("StayOn", cx, 300);
      ctx.font = '500 30px "Cormorant Garamond", Georgia, serif';
      ctx.fillStyle = "#C9C2B4";
      ctx.fillText("Extend the moment. In style.", cx, 356);
      qy = 470;
    }

    // ---- QR + centre emblem ----
    const qrSize = 300;
    const qx = cx - qrSize / 2;
    ctx.fillStyle = cream;
    roundRect(ctx, qx - 14, qy - 14, qrSize + 28, qrSize + 28, 10);
    ctx.fill();
    ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);

    const eSize = 58;
    const ex = cx - eSize / 2;
    const ey = qy + qrSize / 2 - eSize / 2;
    ctx.fillStyle = black;
    roundRect(ctx, ex, ey, eSize, eSize, 8);
    ctx.fill();
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

    // ---- caption ----
    const capY1 = qy + qrSize + 90;
    const capY2 = capY1 + 46;
    ctx.fillStyle = cream;
    const parts: [string, boolean][] = [["Tap ", false], ["here", true], [" to", false]];
    const font = (it: boolean) => `${it ? "italic " : ""}500 36px "Cormorant Garamond", Georgia, serif`;
    ctx.textAlign = "left";
    let total = 0;
    for (const [t, it] of parts) {
      ctx.font = font(it);
      total += ctx.measureText(t).width;
    }
    let sx = cx - total / 2;
    for (const [t, it] of parts) {
      ctx.font = font(it);
      ctx.fillText(t, sx, capY1);
      sx += ctx.measureText(t).width;
    }
    ctx.textAlign = "center";
    ctx.font = '500 36px "Cormorant Garamond", Georgia, serif';
    ctx.fillText("stay one more night", cx, capY2);

    // ---- secondary services line ----
    ctx.fillStyle = "#B9B2A4";
    ctx.font = 'italic 500 26px "Cormorant Garamond", Georgia, serif';
    ctx.fillText("— or a late checkout, or a cleaning —", cx, capY2 + 44);

    const url = c.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `StayOn-plaque-${slug(apartmentName)}.png`;
    a.click();
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
