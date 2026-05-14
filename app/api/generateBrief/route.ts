import { NextResponse } from "next/server";
import { generateBriefFromInput, refineBrief } from "@/lib/ai/generateBrief";
import { createBrief } from "@/lib/supabase/queries";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const { rawInput, draftId, clientName, currentBrief, clientFeedback, files } = await request.json();

    let structuredBriefData;
    
    if (currentBrief && clientFeedback) {
      // Refinement mode
      structuredBriefData = await refineBrief(currentBrief, clientFeedback);
    } else {
      // Original generation mode
      structuredBriefData = await generateBriefFromInput(rawInput || "", files);
    }
    
    if (clientName && structuredBriefData.title === 'Untitled Project') {
      structuredBriefData.title = `Project Brief for ${clientName}`;
    }
    
    structuredBriefData.client_name = clientName || currentBrief?.client_name;
    structuredBriefData.status = 'pending';

    let savedBrief;

    if (draftId) {
      const { data, error } = await supabase
        .from('briefs')
        .update({ 
          ...structuredBriefData, 
          raw_input: rawInput || currentBrief?.raw_input,
          client_feedback: null // Clear feedback after successful regeneration/refinement
        })
        .eq('id', draftId)
        .select()
        .single();
        
      if (error) throw error;
      savedBrief = data;
    } else {
      savedBrief = await createBrief(structuredBriefData);
    }

    return NextResponse.json({ success: true, data: savedBrief });
  } catch (error: any) {
    console.error("Error in /api/generateBrief:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
