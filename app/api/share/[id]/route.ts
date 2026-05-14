import { NextResponse } from 'next/server';
import { getBrief } from '@/lib/supabase/queries';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brief = await getBrief(id);
    return NextResponse.json(brief);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
