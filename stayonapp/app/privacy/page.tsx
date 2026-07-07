import { LegalShell, Section } from "@/components/ui/LegalShell";

export const metadata = { title: "Privacy Policy — StayOn" };

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="July 2026">
      <p>
        This Privacy Policy explains how StayOn (&quot;we&quot;, &quot;us&quot;) collects and uses
        personal data when hosts and agencies use our platform and when guests
        extend their stay through a StayOn link or QR code. We act as data
        controller for the data described below. Contact:{" "}
        <a href="mailto:privacy@stay-on.app" className="text-gold">privacy@stay-on.app</a>.
      </p>

      <Section title="Data we collect">
        <p>
          <b>Agency accounts:</b> your email, name and agency name when you sign
          up, and the apartments and settings you create.
        </p>
        <p>
          <b>Guests:</b> at checkout we collect the email and name you provide to
          Stripe, and your booking details (apartment, type of extension, amount,
          date). We do <b>not</b> store card numbers — payment data is handled
          entirely by Stripe.
        </p>
        <p>
          <b>Technical:</b> essential cookies to keep you signed in, and basic
          server logs for security and reliability.
        </p>
      </Section>

      <Section title="Why we use it">
        <p>
          To provide the service (accounts, apartments, availability, bookings),
          process payments, send booking confirmations and notifications, and keep
          the platform secure. The legal bases are the performance of a contract
          and our legitimate interest in running a reliable service.
        </p>
      </Section>

      <Section title="Service providers">
        <p>
          We share data only with the processors needed to run StayOn:
          <b> Supabase</b> (database &amp; authentication),
          <b> Stripe</b> (payments),
          <b> Resend</b> (transactional emails), and
          <b> Vercel</b> (hosting). Each processes data on our behalf under their
          own terms and security measures.
        </p>
      </Section>

      <Section title="Retention">
        <p>
          We keep account and booking data for as long as your account is active
          and as required to meet legal, accounting and tax obligations, then
          delete or anonymise it.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          Under the GDPR you may request access to, correction of, or deletion of
          your personal data, object to certain processing, and request data
          portability. To exercise these rights, email{" "}
          <a href="mailto:privacy@stay-on.app" className="text-gold">privacy@stay-on.app</a>.
          You may also lodge a complaint with your local data protection authority.
        </p>
      </Section>

      <Section title="Cookies">
        <p>
          We use only strictly necessary cookies (for authentication and
          security). We do not use advertising or tracking cookies.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We may update this policy. Material changes will be reflected by the
          &quot;Last updated&quot; date above.
        </p>
      </Section>
    </LegalShell>
  );
}
