import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, shopStore } from '@/lib/shop-store';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  return NextResponse.json(shopStore.getBrands(baseUrl));
}
