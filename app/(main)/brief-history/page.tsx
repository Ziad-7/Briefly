import { listBriefs } from "@/lib/supabase/queries";
import BriefHistoryClient from "./BriefHistoryClient";

export default async function BriefHistoryPage() {
  const briefs = await listBriefs();

  return <BriefHistoryClient initialBriefs={briefs} />;
}
