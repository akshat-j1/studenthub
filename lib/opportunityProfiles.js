export async function attachCreatorProfiles(supabaseClient, opportunities) {
  if (!Array.isArray(opportunities) || opportunities.length === 0) {
    return [];
  }

  const userIds = [...new Set(opportunities.map((o) => o.user_id).filter(Boolean))];
  if (userIds.length === 0) {
    return opportunities.map((o) => ({ ...o, creatorProfile: null }));
  }

  const { data: profiles, error } = await supabaseClient
    .from("profiles")
    .select("id, name, role")
    .in("id", userIds);

  if (error || !profiles) {
    return opportunities.map((o) => ({ ...o, creatorProfile: null }));
  }

  const profileById = new Map(profiles.map((p) => [p.id, p]));
  return opportunities.map((o) => ({
    ...o,
    creatorProfile: o.user_id ? profileById.get(o.user_id) ?? null : null,
  }));
}
