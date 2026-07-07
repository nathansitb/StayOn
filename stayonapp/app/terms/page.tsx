import { LegalShell, Section } from "@/components/ui/LegalShell";

export const metadata = { title: "Terms of Service — StayOn" };

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="July 2026">
      <p>
        These Terms govern the use of StayOn by hosts and agencies
        (&quot;you&quot;) and by guests who extend their stay through a StayOn
        link or QR code. By creating an account or making a booking, you accept
        these Terms.
      </p>

      <Section title="The service">
        <p>
          StayOn lets a guest scan a QR code in an apartment to extend their stay,
          request a late checkout or a cleaning, pay online and receive an instant
          confirmation. Agencies manage their apartments, links, availability and
          connections through their StayOn space.
        </p>
      </Section>

      <Section title="Accounts">
        <p>
          You are responsible for the accuracy of the information you provide, for
          keeping your credentials secure, and for the apartments, prices and
          options you publish. You must have the right to offer the apartments you
          add.
        </p>
      </Section>

      <Section title="Bookings & payments">
        <p>
          Payments are processed by Stripe. When a guest pays, the transaction is
          collected on the host or agency&apos;s behalf. The host/agency is
          responsible for actually honouring the extension, late checkout or
          cleaning that was booked, and for the accuracy of availability shown.
        </p>
      </Section>

      <Section title="Our fees">
        <p>
          StayOn is free to set up and use. StayOn earns a commission on each
          booking made through the platform. There is no monthly fee.
        </p>
      </Section>

      <Section title="Availability">
        <p>
          Availability shown to guests is based on the calendars and integrations
          you connect (e.g. iCal). These may update with a delay and are provided
          on a best-effort basis; you remain responsible for avoiding overbookings
          on your own channels.
        </p>
      </Section>

      <Section title="Cancellations & refunds">
        <p>
          Cancellation and refund conditions are set by the host or agency. Any
          refund is processed through Stripe according to those conditions.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          StayOn provides the platform &quot;as is&quot; and does not guarantee
          uninterrupted or error-free operation. To the extent permitted by law,
          StayOn is not liable for indirect or consequential damages, or for the
          conduct of hosts, agencies or guests.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          You may stop using StayOn at any time. We may suspend or terminate access
          in case of misuse, fraud or breach of these Terms.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These Terms are governed by French law. Questions:{" "}
          <a href="mailto:hello@stay-on.app" className="text-gold">hello@stay-on.app</a>.
        </p>
      </Section>
    </LegalShell>
  );
}
