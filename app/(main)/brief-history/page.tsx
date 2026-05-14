import { listBriefs } from "@/lib/supabase/queries";
import BriefHistoryClient from "./BriefHistoryClient";

export const dynamic = 'force-dynamic';

export default async function BriefHistoryPage() {
  const briefs = await listBriefs();

  return <BriefHistoryClient initialBriefs={briefs} />;
}
