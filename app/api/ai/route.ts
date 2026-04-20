import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

type OpportunityInput = {
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  company?: string;
  location?: string;
  deadline?: string;
  tags?: string[];
  isBeginnerFriendly?: boolean;
  isRemote?: boolean;
  isPaid?: boolean;
  prize?: string;
  salary?: string;
};

export async function POST(request: Request) {
  let apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Fallback for dev sessions where env vars were not picked up after start.
    const envPath = join(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
      const line = readFileSync(envPath, 'utf8')
        .split('\n')
        .find((item) => item.startsWith('GEMINI_API_KEY='));
      if (line) {
        apiKey = line.slice('GEMINI_API_KEY='.length).trim();
      }
    }
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const opportunities: OpportunityInput[] = Array.isArray(body?.opportunities) ? body.opportunities : [];

    if (opportunities.length === 0) {
      return NextResponse.json({ error: 'No opportunities provided' }, { status: 400 });
    }

    const compactInput = opportunities.map((item) => ({
      id: item.id,
      title: item.title,
      company: item.company,
      type: item.type,
      location: item.location,
      deadline: item.deadline,
      tags: item.tags ?? [],
      isBeginnerFriendly: item.isBeginnerFriendly ?? false,
      isRemote: item.isRemote ?? false,
      isPaid: item.isPaid ?? false,
      prize: item.prize ?? null,
      salary: item.salary ?? null,
      description: item.description,
    }));

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Pick top 5 best opportunities for a student and explain briefly why.\n\nOpportunities:\n${JSON.stringify(compactInput)}`;
    const completion = await model.generateContent(prompt);
    
    const result = completion.response.text().trim() || 'No recommendation generated.';
    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error('AI recommendation error:', error);
    
    // Check if the error is related to authentication
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate recommendations';
    if (errorMessage.includes('API key not valid') || errorMessage.includes('API key')) {
      return NextResponse.json({ error: 'Invalid Gemini API key. Please check your .env.local file.' }, { status: 401 });
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
