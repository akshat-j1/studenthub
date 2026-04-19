import { NextResponse } from 'next/server';

import { connectDB } from '@/lib/mongodb';
import Opportunity from '@/models/Opportunity';

export async function GET() {
  await connectDB();
  const opportunities = await Opportunity.find().lean();

  return NextResponse.json(opportunities);
}