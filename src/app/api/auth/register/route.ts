import { NextRequest, NextResponse } from 'next/server';
import { shopStore } from '@/lib/shop-store';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const result = shopStore.register(body);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status },
    );
  }
  return NextResponse.json(
    {
      token: result.token,
      user: result.user,
    },
    { status: 201 },
  );
}
