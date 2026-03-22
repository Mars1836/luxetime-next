import { NextRequest, NextResponse } from 'next/server';
import { shopStore } from '@/lib/shop-store';

export async function GET(request: NextRequest) {
  const auth = request.headers.get('authorization');
  const result = shopStore.myOrders(auth);
  if (!result.ok) {
    return NextResponse.json(
      { message: result.message },
      { status: result.status },
    );
  }
  return NextResponse.json(result.orders);
}
