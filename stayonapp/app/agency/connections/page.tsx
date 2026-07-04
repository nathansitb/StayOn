import { requireAgency } from "@/lib/agency-auth";
import { AgencyConnections } from "@/components/agency/AgencyConnections";

export const dynamic = "force-dynamic";

export default async function AgencyConnectionsPage() {
  await requireAgency();
  return (
    <div>
      <h1 className="font-serif text-[28px] font-semibold">Connections</h1>
      <p className="text-muted text-[13px] mt-1">
        Live availability from your channels. Secrets never leave the server.
      </p>
      <AgencyConnections />
    </div>
  );
}
