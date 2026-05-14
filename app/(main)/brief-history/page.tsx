import { listBriefs } from "@/lib/supabase/queries";
import BriefHistoryClient from "./BriefHistoryClient";

export const dynamic = 'force-dynamic';

export default async function BriefHistoryPage() {
  let briefs = [];
  try {
    briefs = await listBriefs();
  } catch (error) {
    console.error("BriefHistory data fetch failed:", error);
  }

  return <BriefHistoryClient initialBriefs={briefs} />;
}
