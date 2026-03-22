import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, shopStore } from '@/lib/shop-store';

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const { searchParams } = request.nextUrl;
  const result = shopStore.filterProducts(baseUrl, {
    brand: searchParams.get('brand'),
    gender: searchParams.get('gender'),
    movement: searchParams.get('movement'),
    minPrice: searchParams.get('minPrice'),
    maxPrice: searchParams.get('maxPrice'),
    search: searchParams.get('search'),
  });
  return NextResponse.json(result);
}
