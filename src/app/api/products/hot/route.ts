import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, shopStore } from '@/lib/shop-store';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get('limit')) || 6,
    20,
  );
  return NextResponse.json(shopStore.getHot(baseUrl, limit));
}
