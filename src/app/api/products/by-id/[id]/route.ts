import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, shopStore } from '@/lib/shop-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const baseUrl = getBaseUrl(request);
  const product = shopStore.getById(baseUrl, Number(id));
  if (!product) {
    return NextResponse.json(
      { message: 'Không tìm thấy sản phẩm.' },
      { status: 404 },
    );
  }
  return NextResponse.json(product);
}
