import { NextResponse } from 'next/server';
import { createBrief } from '@/lib/supabase/queries';

export async function POST() {
  try {
    const dummyBrief = {
      title: 'Test Brief ' + new Date().toISOString(),
      summary: 'This is a test brief generated to verify the Supabase connection.',
      goals: ['Verify DB', 'Check permissions'],
      status: 'draft'
    };

    const insertedBrief = await createBrief(dummyBrief);
    return NextResponse.json({ success: true, data: insertedBrief });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
