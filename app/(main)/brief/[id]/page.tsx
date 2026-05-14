import { getBrief } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import BriefDetailClient from "./BriefDetailClient";

export default async function GeneratedBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const brief = await getBrief(resolvedParams.id);

  if (!brief) {
    notFound();
  }

  return <BriefDetailClient initialBrief={brief} />;
}
