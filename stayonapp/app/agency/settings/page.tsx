import { requireAgency } from "@/lib/agency-auth";
import { PlanSelector } from "@/components/agency/PlanSelector";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AgencySettings() {
  const { agencyId, agencyName, email, plan } = await requireAgency();

  return (
    <div>
      <h1 className="font-serif text-[28px] font-semibold">Settings</h1>
      <p className="text-muted text-[13px] mt-1">Your account and plan.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="card p-6">
          <div className="font-serif text-[17px] font-semibold">Account</div>
          <div className="mt-4 space-y-3 text-[14px]">
            <Row k="Agency" v={agencyName} />
            <Row k="Email" v={email} />
            <Row k="Current plan" v={plan} />
          </div>
          <div className="mt-6">
            <SignOutButton />
          </div>
        </div>

        <div className="card p-6">
          <div className="font-serif text-[17px] font-semibold">Plan</div>
          <p className="text-[13px] text-muted mt-2">Upgrade when it pays for itself.</p>
          <div className="mt-4">
            {agencyId && <PlanSelector agencyId={agencyId} plan={plan} />}
          </div>
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
