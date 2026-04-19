import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import Opportunity from '@/models/Opportunity';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  await connectDB();
  const opportunity = await Opportunity.findOne({ id }).lean();

  if (!opportunity) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
  }

  return NextResponse.json(opportunity);
}
