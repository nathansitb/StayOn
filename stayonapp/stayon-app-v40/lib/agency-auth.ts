import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

/**
 * Guards an agency page: requires a logged-in agency user.
 * Redirects guests to /login and super-admins to /admin.
 * Returns the agency context (server-side, session-scoped).
 */
export async function requireAgency() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, agency_id")
    .eq("id", user.id)
    .single();
  if (profile?.role === "super_admin") redirect("/admin");

  const { data: agency } = await supabase
    .from("agencies")
    .select("name, plan")
    .eq("id", profile?.agency_id)
    .single();

  return {
    supabase,
    userId: user.id,
    email: user.email ?? "",
    agencyId: (profile?.agency_id as string | undefined) ?? "",
    agencyName: agency?.name ?? "Your agency",
    plan: (agency?.plan as string | undefined) ?? "free",
  };
}
