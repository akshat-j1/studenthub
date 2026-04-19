import { NextResponse } from 'next/server';

import { getOpportunityById } from '@/lib/data';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteContext) {
  const { id } = await params;
  const opportunity = getOpportunityById(id);

  if (!opportunity) {
    return NextResponse.json({ error: 'Opportunity not found' }, { status: 404 });
  }

  return NextResponse.json(opportunity);
}
