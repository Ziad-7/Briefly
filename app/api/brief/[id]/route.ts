import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// GET a specific brief
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { data, error } = await supabase
      .from("briefs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error fetching brief:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a specific brief
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from("briefs")
      .delete()
      .eq("id", id);

    if (error) throw error;
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting brief:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PATCH a specific brief (e.g. toggle pin)
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const updates = await request.json();
    
    const { data, error } = await supabase
      .from("briefs")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Error updating brief:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
