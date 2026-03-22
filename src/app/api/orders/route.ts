import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, shopStore } from '@/lib/shop-store';

export async function GET() {
  return NextResponse.json(shopStore.listOrders());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const baseUrl = getBaseUrl(request);
  const auth = request.headers.get('authorization');
  const result = shopStore.createOrder(baseUrl, body, auth);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status },
    );
  }
  return NextResponse.json(result.order, { status: 201 });
}
