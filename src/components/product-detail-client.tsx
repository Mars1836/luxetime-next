'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

const AUTH_TOKEN_KEY = 'shop_auth_token';

export function ProductDetailClient({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [mainImg, setMainImg] = useState('');
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!slug) {
        setLoading(false);
        setError('Thiếu mã sản phẩm. Vui lòng chọn sản phẩm từ trang chủ.');
        return;
      }
      try {
        const res = await fetch(
          `/api/products/${encodeURIComponent(slug)}`,
        );
        if (!res.ok) {
          throw new Error(
            res.status === 404
              ? 'Không tìm thấy sản phẩm.'
              : 'Lỗi tải dữ liệu.',
          );
        }
        const p = (await res.json()) as Product;
        if (cancelled) return;
        setProduct(p);
        const first = p.images?.[0] || '';
        setMainImg(first);
        document.title = `${p.name} - Luxe Time`;
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Không tải được thông tin.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  function formatCurrency(value: number) {
    return value.toLocaleString('vi-VN') + '₫';
  }

  async function submitOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!product) return;
    const form = e.currentTarget;
    const customerName = (
      form.elements.namedItem('customerName') as HTMLInputElement
    ).value.trim();
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();
    const address = (
      form.elements.namedItem('address') as HTMLTextAreaElement
    ).value.trim();
    const quantity = Math.max(
      1,
      parseInt(
        (form.elements.namedItem('quantity') as HTMLInputElement).value,
        10,
      ) || 1,
    );

    const btn = form.querySelector(
      'button[type="submit"]',
    ) as HTMLButtonElement;
    btn.disabled = true;
    btn.textContent = 'Đang gửi...';

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem(AUTH_TOKEN_KEY)
          : null;
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerName,
          phone,
          address,
          items: [{ productId: product.id, quantity }],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { message?: string }).message || 'Đặt hàng thất bại.',
        );
      }
      setOrderOpen(false);
      alert(
        `Đặt hàng thành công! Mã đơn: #${(data as { id?: number }).id || ''}. Chúng tôi sẽ liên hệ bạn sớm.`,
      );
      form.reset();
      (form.elements.namedItem('quantity') as HTMLInputElement).value = '1';
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : 'Có lỗi xảy ra. Vui lòng thử lại.',
      );
    } finally {
      btn.disabled = false;
      btn.textContent = 'Xác nhận đặt hàng';
    }
  }

  return (
    <>
      <header>
        <div className="top-bar">
          <div className="top-bar-content">
            <span>
              📞 Hotline: <a href="tel:1900xxxx">1900 6868</a> | Miễn phí vận
              chuyển đơn từ 5 triệu
            </span>
            <span>🏪 Hệ thống 15+ cửa hàng toàn quốc</span>
          </div>
        </div>
        <nav>
          <Link href="/" className="logo">
            LUXE<span>TIME</span>
          </Link>
          <ul className="nav-links">
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li>
              <Link href="/#featured">Sản phẩm</Link>
            </li>
            <li>
              <Link href="/#categories">Danh mục</Link>
            </li>
          </ul>
          <div className="nav-icons">
            <Link href="/#featured">🔍</Link>
            <Link href="/">👤</Link>
            <Link href="/#featured" className="cart-icon">
              🛒<span className="cart-count">0</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="product-detail-wrap">
        {loading && (
          <div id="product-loading" className="product-loading">
            Đang tải...
          </div>
        )}
        {!loading && error && (
          <div id="product-error" className="product-error">
            {error}
          </div>
        )}
        {!loading && !error && product && (
          <div id="product-detail" className="product-detail">
            <div className="product-detail__gallery">
              <img
                id="product-main-img"
                src={mainImg}
                alt={product.name}
              />
              <div id="product-thumbs" className="product-thumbs">
                {(product.images || []).map((url, i) => (
                  <img
                    key={url + i}
                    src={url}
                    alt={`${product.name} ${i + 1}`}
                    loading="lazy"
                    className={url === mainImg ? 'active' : ''}
                    onClick={() => setMainImg(url)}
                  />
                ))}
              </div>
            </div>
            <div className="product-detail__info">
              <span className="product-detail__brand">{product.brand}</span>
              <h1 className="product-detail__name">{product.name}</h1>
              <div className="product-detail__price" id="product-price">
                {formatCurrency(product.price)}
              </div>
              <p className="product-detail__desc">
                {product.description || '—'}
              </p>
              <ul className="product-detail__specs" id="product-specs">
                {product.gender && (
                  <li>Giới tính: {product.gender}</li>
                )}
                {product.movement && (
                  <li>Bộ máy: {product.movement}</li>
                )}
                {product.waterResistance && (
                  <li>Chống nước: {product.waterResistance}</li>
                )}
              </ul>
              <p
                className={
                  'product-detail__stock ' +
                  (product.stock > 0 ? 'in-stock' : 'out-of-stock')
                }
              >
                {product.stock > 0
                  ? `Còn hàng (${product.stock})`
                  : 'Hết hàng'}
              </p>
              <div className="product-detail__actions">
                <button
                  type="button"
                  className="btn btn-primary btn-lg"
                  id="btn-order"
                  disabled={product.stock <= 0}
                  onClick={() => setOrderOpen(true)}
                >
                  Đặt hàng
                </button>
                <Link href="/" className="btn btn-outline">
                  ← Quay lại danh sách
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>

      {orderOpen && product && (
        <div id="order-modal" className="order-modal" style={{ display: 'flex' }}>
          <div
            className="order-modal__backdrop"
            role="presentation"
            onClick={() => setOrderOpen(false)}
          />
          <div className="order-modal__box">
            <h2 className="order-modal__title">Đặt hàng</h2>
            <p className="order-modal__product" id="order-modal-product">
              {product.name} – {formatCurrency(product.price)}
            </p>
            <form id="order-form" className="order-form" onSubmit={submitOrder}>
              <label>
                <span>Họ tên *</span>
                <input
                  type="text"
                  name="customerName"
                  required
                  placeholder="Nguyễn Văn A"
                />
              </label>
              <label>
                <span>Số điện thoại *</span>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="0901234567"
                />
              </label>
              <label>
                <span>Địa chỉ giao hàng *</span>
                <textarea
                  name="address"
                  required
                  rows={3}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
                />
              </label>
              <label>
                <span>Số lượng</span>
                <input
                  type="number"
                  name="quantity"
                  defaultValue={1}
                  min={1}
                />
              </label>
              <div className="order-form__actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  id="order-modal-close"
                  onClick={() => setOrderOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  Xác nhận đặt hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer>
        <div className="footer-bottom">
          <span>© 2026 Luxe Time. All rights reserved.</span>
        </div>
      </footer>
    </>
  );
}
