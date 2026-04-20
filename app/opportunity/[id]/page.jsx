import { notFound } from "next/navigation";

import { getOpportunityById, opportunities } from "@/lib/data";
import { supabase } from "@/lib/supabase";
import OpportunityDetailClient from "@/components/OpportunityDetailClient";

export function generateStaticParams() {
  return opportunities.map((o) => ({ id: o.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const o = getOpportunityById(id);
  if (!o) {
    return { title: "Opportunity not found — StudentHub" };
  }
  return {
    title: `${o.title} — StudentHub`,
    description: o.description.slice(0, 160),
  };
}

export default async function OpportunityDetailPage({ params }) {
  const { id } = await params;
  let opportunity = getOpportunityById(id);

  if (!opportunity && supabase) {
    const { data } = await supabase
      .from("opportunities")
      .select("*")
      .eq("id", id)
      .single();
    if (data) {
      opportunity = data;
    }
  }

  if (!opportunity) {
    notFound();
  }

  return <OpportunityDetailClient opportunity={opportunity} />;
}
