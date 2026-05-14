import { NextResponse } from 'next/server';
import { listBriefs, createBrief } from '@/lib/supabase/queries';

export async function GET() {
  try {
    const briefs = await listBriefs();
    return NextResponse.json(briefs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const brief = await createBrief(data);
    return NextResponse.json(brief);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
