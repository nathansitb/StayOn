import { requireAgency } from "@/lib/agency-auth";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AgencySettings() {
  const { agencyName, email } = await requireAgency();

  return (
    <div>
      <h1 className="font-serif text-[28px] font-semibold">Settings</h1>
      <p className="text-muted text-[13px] mt-1">Your account.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="card p-6">
          <div className="font-serif text-[17px] font-semibold">Account</div>
          <div className="mt-4 space-y-3 text-[14px]">
            <Row k="Agency" v={agencyName} />
            <Row k="Email" v={email} />
          </div>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>

        <div className="card p-6" style={{ borderColor: "rgba(198,167,106,.35)" }}>
          <div className="font-serif text-[17px] font-semibold">Pricing</div>
          <div className="font-serif text-[32px] font-semibold text-gold mt-3">Free</div>
          <p className="text-[13px] text-creamDim mt-3 leading-[1.6]">
            No monthly fee. StayOn only earns a small commission on each booking —
            you pay nothing to set up, and nothing unless you earn.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between border-b border-line pb-3 last:border-b-0">
      <span className="text-muted">{k}</span>
      <span className="text-cream font-medium capitalize">{v}</span>
    </div>
  );
}
