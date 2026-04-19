import OpenAI from 'openai';
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
  let apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fallback for dev sessions where env vars were not picked up after start.
    const envPath = join(process.cwd(), '.env.local');
    if (existsSync(envPath)) {
      const line = readFileSync(envPath, 'utf8')
        .split('\n')
        .find((item) => item.startsWith('OPENAI_API_KEY='));
      if (line) {
        apiKey = line.slice('OPENAI_API_KEY='.length).trim();
      }
    }
  }

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing OPENAI_API_KEY' }, { status: 500 });
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

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an assistant that recommends opportunities for students. Keep recommendations concise and practical.',
        },
        {
          role: 'user',
          content: `Pick top 5 best opportunities for a student and explain briefly why.\n\nOpportunities:\n${JSON.stringify(compactInput)}`,
        },
      ],
      temperature: 0.4,
    });

    const result = completion.choices[0]?.message?.content?.trim() ?? 'No recommendation generated.';
    return NextResponse.json({ result });
  } catch (error: unknown) {
    console.error('AI recommendation error:', error);
    const message = error instanceof Error ? error.message : '';
    if (message.includes('insufficient_quota') || message.includes('exceeded your current quota')) {
      return NextResponse.json(
        {
          error:
            'OpenAI quota exceeded for this API key. Add billing/credits in OpenAI dashboard or use another API key.',
        },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}
