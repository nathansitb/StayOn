import { requireAgency } from "@/lib/agency-auth";
import { getAgencySettings, SETTINGS_TABS, type SettingsTab } from "@/lib/agency-settings";
import { SettingsEditor } from "@/components/agency/SettingsEditor";
import { PageHeader } from "@/components/agency/ui";

export const dynamic = "force-dynamic";

export default async function AgencySettings({ searchParams }: { searchParams: { tab?: string } }) {
  const { supabase, agencyId, agencyName, email } = await requireAgency();
  const [settings, { count }] = await Promise.all([
    getAgencySettings(supabase, agencyId),
    supabase.from("apartments").select("id", { count: "exact", head: true }),
  ]);
  const tab = (SETTINGS_TABS.find((t) => t.id === searchParams.tab)?.id ?? "profile") as SettingsTab;

  return (
    <div>
      <PageHeader title="Settings" sub="Customise your guest page, your services and prices, your notifications and your account." />
      <SettingsEditor
        agencyId={agencyId}
        initial={settings}
        initialTab={tab}
        agencyName={agencyName}
        email={email}
        apartmentCount={count ?? 0}
      />
    </div>
  );
}
