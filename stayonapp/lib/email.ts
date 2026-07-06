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

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://stay-on11.vercel.app";
}

function shell(inner: string): string {
  const site = siteUrl();
  return `<!doctype html><html><body style="margin:0;background:#0B0B0B;font-family:Georgia,'Times New Roman',serif">
  <div style="max-width:540px;margin:0 auto">
    <div style="text-align:center;padding:36px 24px 8px">
      <img src="${site}/logo.png" alt="StayOn" width="180" style="max-width:180px;height:auto;display:inline-block" />
    </div>
    <div style="background:#ffffff;border-radius:8px;margin:18px 20px 8px;padding:30px 28px">${inner}</div>
    <div style="text-align:center;color:#6b675e;font-size:12px;padding:14px 24px 40px;font-family:Arial,sans-serif">
      StayOn · Extend the moment. In style.
    </div>
  </div></body></html>`;
}

function row(k: string, v: string): string {
  return `<tr>
    <td style="color:#8B857A;padding:9px 0;font-family:Arial,sans-serif;font-size:12px;border-bottom:1px solid #efece4;text-transform:uppercase;letter-spacing:.5px">${k}</td>
    <td style="text-align:right;color:#0B0B0B;padding:9px 0;font-size:14px;border-bottom:1px solid #efece4">${v}</td>
  </tr>`;
}

export function guestEmailHtml(o: {
  aptName: string;
  address: string;
  typeLabel: string;
  when: string;
  amount: string;
  reference: string;
}): string {
  return shell(`
    <div style="color:#0B0B0B;font-size:22px;font-weight:600">You're all set.</div>
    <p style="color:#5f5a51;font-size:14px;line-height:1.65;font-family:Arial,sans-serif;margin:10px 0 20px">
      Your booking at <b>${o.aptName}</b> is confirmed. Enjoy the moment, a little longer.
    </p>
    <table style="width:100%;border-collapse:collapse">
      ${row("Apartment", o.aptName)}
      ${o.address ? row("Address", o.address) : ""}
      ${row("Booking", o.typeLabel)}
      ${row("When", o.when)}
      ${row("Reference", o.reference)}
      <tr><td style="padding:14px 0 0;font-size:18px;font-weight:600">Total paid</td>
      <td style="text-align:right;padding:14px 0 0;font-size:18px;font-weight:600">${o.amount}</td></tr>
    </table>
    <p style="color:#a8a294;font-size:12px;font-family:Arial,sans-serif;margin-top:22px">
      Secured payment powered by Stripe. Need help? Just reply to this email.
    </p>
  `);
}

export function agencyEmailHtml(o: {
  aptName: string;
  address: string;
  typeLabel: string;
  amount: string;
  guest: string;
  reference: string;
}): string {
  return shell(`
    <div style="color:#0B0B0B;font-size:22px;font-weight:600">New booking</div>
    <p style="color:#5f5a51;font-size:14px;line-height:1.65;font-family:Arial,sans-serif;margin:10px 0 20px">
      A guest just booked through StayOn.
    </p>
    <table style="width:100%;border-collapse:collapse">
      ${row("Apartment", o.aptName)}
      ${o.address ? row("Address", o.address) : ""}
      ${row("Guest", o.guest)}
      ${row("Booking", o.typeLabel)}
      ${row("Reference", o.reference)}
      <tr><td style="padding:14px 0 0;font-size:18px;font-weight:600">Amount</td>
      <td style="text-align:right;padding:14px 0 0;font-size:18px;font-weight:600">${o.amount}</td></tr>
    </table>
  `);
}
