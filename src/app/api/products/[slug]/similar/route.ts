import { NextRequest, NextResponse } from 'next/server';
import { getBaseUrl, shopStore } from '@/lib/shop-store';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const baseUrl = getBaseUrl(request);
  const product = shopStore.getBySlug(baseUrl, slug);
  if (!product) {
    return NextResponse.json(
      { message: 'Không tìm thấy sản phẩm.' },
      { status: 404 },
    );
  }
  const limit = Math.min(
    Number(request.nextUrl.searchParams.get('limit')) || 4,
    10,
  );
  return NextResponse.json(shopStore.getSimilar(baseUrl, slug, limit));
}
