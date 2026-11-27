import { requireAgency } from "@/lib/agency-auth";
import { ApartmentsManager } from "@/components/agency/ApartmentsManager";

export const dynamic = "force-dynamic";

export default async function AgencyApartments() {
  const { agencyId } = await requireAgency();
  return (
    <div>
      <h1 className="font-serif text-[28px] font-semibold">Apartments</h1>
      <p className="text-muted text-[13px] mt-1">
        Add your apartments. Each gets a unique link, a scannable QR and a
        printable plaque.
      </p>
      {agencyId && <ApartmentsManager agencyId={agencyId} />}
    </div>
  );
}
