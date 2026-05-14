import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: Request) {
  try {
    const { id, clientName, rawInput, fileReferences } = await request.json();

    const draftData = {
      title: clientName ? `Draft for ${clientName}` : 'Untitled Draft',
      client_name: clientName,
      raw_input: rawInput,
      file_references: fileReferences,
      status: 'draft',
    };

    let data, error;

    if (id) {
      // Update existing draft
      const res = await supabase
        .from('briefs')
        .update(draftData)
        .eq('id', id)
        .select()
        .single();
      data = res.data;
      error = res.error;
    } else {
      // Create new draft
      const res = await supabase
        .from('briefs')
        .insert([draftData])
        .select()
        .single();
      data = res.data;
      error = res.error;
    }

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error in /api/draft:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from('briefs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting draft:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
