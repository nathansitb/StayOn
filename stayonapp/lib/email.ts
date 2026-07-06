/**
 * Transactional emails via Resend. Fails silently if not configured, so a
 * missing key never breaks a booking.
 */
export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return;
  const from = process.env.EMAIL_FROM || "StayOn <onboarding@resend.dev>";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
  } catch {
    /* ignore */
  }
}

function shell(inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:520px;margin:0 auto;padding:40px 24px">
    <div style="text-align:center;color:#0B0B0B;font-size:30px;font-weight:600;letter-spacing:.5px">StayOn</div>
    <div style="text-align:center;color:#8B857A;font-style:italic;font-size:14px;margin-top:4px">Extend the moment. In style.</div>
    <div style="background:#ffffff;border:1px solid #e7e1d4;border-radius:6px;padding:28px;margin-top:26px">${inner}</div>
    <div style="text-align:center;color:#a8a294;font-size:12px;margin-top:20px;font-family:Arial,sans-serif">StayOn · Extend the moment. In style.</div>
  </div></body></html>`;
}

function row(k: string, v: string): string {
  return `<tr><td style="color:#8B857A;padding:8px 0;font-family:Arial,sans-serif;font-size:13px">${k}</td>
  <td style="text-align:right;color:#0B0B0B;padding:8px 0;font-size:14px">${v}</td></tr>`;
}

export function guestEmailHtml(o: { aptName: string; typeLabel: string; amount: string; detail: string }): string {
  return shell(`
    <div style="color:#0B0B0B;font-size:20px;font-weight:600">You're all set.</div>
    <p style="color:#5f5a51;font-size:14px;line-height:1.6;font-family:Arial,sans-serif">
      Your booking at <b>${o.aptName}</b> is confirmed. Enjoy a little longer.</p>
    <table style="width:100%;border-top:1px solid #eee;margin-top:12px">
      ${row("Apartment", o.aptName)}
      ${row("Type", o.typeLabel)}
      ${row("When", o.detail)}
      ${row("Total paid", o.amount)}
    </table>
  `);
}

export function agencyEmailHtml(o: { aptName: string; typeLabel: string; amount: string; guest: string }): string {
  return shell(`
    <div style="color:#0B0B0B;font-size:20px;font-weight:600">New booking 🎉</div>
    <p style="color:#5f5a51;font-size:14px;line-height:1.6;font-family:Arial,sans-serif">
      A guest just booked through StayOn.</p>
    <table style="width:100%;border-top:1px solid #eee;margin-top:12px">
      ${row("Apartment", o.aptName)}
      ${row("Guest", o.guest)}
      ${row("Type", o.typeLabel)}
      ${row("Amount", o.amount)}
    </table>
  `);
}
