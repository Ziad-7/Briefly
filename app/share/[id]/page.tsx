import { getBrief } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import SharedBriefClient from "./SharedBriefClient";

export default async function SharedBriefPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const brief = await getBrief(resolvedParams.id);

  if (!brief) {
    notFound();
  }

  return <SharedBriefClient initialBrief={brief} />;
}
