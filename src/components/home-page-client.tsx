'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Product } from '@/lib/types';

const AUTH_TOKEN_KEY = 'shop_auth_token';
const AUTH_USER_KEY = 'shop_auth_user';

type AuthUser = { id: number; name: string; email: string };

export function HomePageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState(0);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const t = localStorage.getItem(AUTH_TOKEN_KEY);
    try {
      setAuthUser(
        t ? JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null') : null,
      );
    } catch {
      setAuthUser(null);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/products');
        const data = (await res.json()) as Product[];
        if (!cancelled) setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function saveAuth(token: string | null, user: AuthUser | null) {
    setAuthUser(user);
    if (token && user) {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }

  function formatCurrency(value: number) {
    return value.toLocaleString('vi-VN');
  }

  function showNotification(message: string) {
    const existing = document.querySelector('.notification');
    existing?.remove();
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: #1a1a2e;
      color: white;
      padding: 1rem 2rem;
      border-radius: 8px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.3s ease;
      font-size: 0.95rem;
    `;
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
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
              <a href="#featured">Nam</a>
            </li>
            <li>
              <a href="#featured">Nữ</a>
            </li>
            <li>
              <a href="#featured">Thương hiệu</a>
            </li>
            <li>
              <a href="#newsletter">Khuyến mãi</a>
            </li>
            <li>
              <a href="#footer">Tin tức</a>
            </li>
          </ul>
          <div className="nav-icons">
            <a href="#featured">🔍</a>
            <a
              href="#"
              id="auth-link"
              onClick={(e) => {
                e.preventDefault();
                if (authUser) {
                  if (
                    confirm('Bạn muốn đăng xuất khỏi tài khoản này?')
                  ) {
                    saveAuth(null, null);
                    alert('Đã đăng xuất.');
                  }
                } else {
                  setAuthTab('login');
                  setAuthModalOpen(true);
                }
              }}
            >
              {authUser && authUser.name
                ? `👤 ${authUser.name.split(' ')[0] || 'Tài khoản'}`
                : '👤'}
            </a>
            <a href="#" className="cart-icon" onClick={(e) => e.preventDefault()}>
              🛒<span className="cart-count">{cartItems}</span>
            </a>
          </div>
        </nav>
      </header>

      <section className="hero">
        <div className="hero-content">
          <h1>
            Thời Gian Là<br />
            <span>Nghệ Thuật</span>
          </h1>
          <p>
            Khám phá bộ sưu tập đồng hồ cao cấp từ các thương hiệu hàng đầu thế
            giới. Bảo hành chính hãng, trả góp 0%.
          </p>
          <a href="#featured" className="btn btn-primary">
            Khám phá ngay
          </a>
          <a href="#featured" className="btn btn-outline">
            Xem bộ sưu tập
          </a>
        </div>
      </section>

      <section className="brands">
        <div className="brands-container">
          <span className="brand-logo">ROLEX</span>
          <span className="brand-logo">OMEGA</span>
          <span className="brand-logo">TAG HEUER</span>
          <span className="brand-logo">TISSOT</span>
          <span className="brand-logo">LONGINES</span>
          <span className="brand-logo">SEIKO</span>
        </div>
      </section>

      <section className="featured" id="featured">
        <div className="section-title">
          <h2>Sản Phẩm Nổi Bật</h2>
          <p>Những mẫu đồng hồ được yêu thích nhất</p>
        </div>
        <div className="products-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              {product.stock <= 5 && (
                <span className="product-badge">Hot</span>
              )}
              <div className="product-image">
                <Link
                  href={`/product/${encodeURIComponent(product.slug)}`}
                  className="product-image-link"
                >
                  <img
                    src={
                      product.images?.[0] ||
                      '/images/products/rolex-submariner-116610ln-1.jpg'
                    }
                    alt={product.name}
                  />
                </Link>
                <div className="product-actions">
                  <button
                    type="button"
                    className="action-btn action-wishlist"
                    onClick={(e) => {
                      e.preventDefault();
                      showNotification('Đã thêm vào yêu thích!');
                    }}
                  >
                    ❤️
                  </button>
                  <button
                    type="button"
                    className="action-btn action-quickview"
                    onClick={(e) => {
                      e.preventDefault();
                      showNotification('Tính năng xem nhanh đang phát triển');
                    }}
                  >
                    👁️
                  </button>
                  <button
                    type="button"
                    className="action-btn action-add-to-cart"
                    onClick={(e) => {
                      e.preventDefault();
                      setCartItems((c) => c + 1);
                      showNotification(
                        'Đã thêm vào giỏ hàng (demo, chưa lưu đơn)!',
                      );
                    }}
                  >
                    🛒
                  </button>
                </div>
              </div>
              <div className="product-info">
                <span className="product-brand">{product.brand}</span>
                <h3 className="product-name">
                  <Link href={`/product/${encodeURIComponent(product.slug)}`}>
                    {product.name}
                  </Link>
                </h3>
                <div className="product-price">
                  <span className="current-price">
                    {formatCurrency(product.price)}₫
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="categories" id="categories">
        <div className="section-title">
          <h2>Danh Mục Sản Phẩm</h2>
          <p>Khám phá theo phong cách của bạn</p>
        </div>
        <div className="categories-grid">
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600"
              alt="Đồng hồ nam"
            />
            <div className="category-overlay">
              <h3>Đồng Hồ Nam</h3>
              <p>Phong cách mạnh mẽ, lịch lãm</p>
              <a href="#featured" className="category-link">
                Xem thêm →
              </a>
            </div>
          </div>
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600"
              alt="Đồng hồ nữ"
            />
            <div className="category-overlay">
              <h3>Đồng Hồ Nữ</h3>
              <p>Thanh lịch, tinh tế</p>
              <a href="#featured" className="category-link">
                Xem thêm →
              </a>
            </div>
          </div>
          <div className="category-card">
            <img
              src="https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600"
              alt="Đồng hồ cao cấp"
            />
            <div className="category-overlay">
              <h3>Luxury Collection</h3>
              <p>Đẳng cấp thượng lưu</p>
              <a href="#featured" className="category-link">
                Xem thêm →
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">✓</div>
            <h4>100% Chính Hãng</h4>
            <p>Cam kết sản phẩm chính hãng, tem bảo hành quốc tế</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚚</div>
            <h4>Giao Hàng Miễn Phí</h4>
            <p>Miễn phí vận chuyển toàn quốc cho đơn từ 5 triệu</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h4>Đổi Trả 30 Ngày</h4>
            <p>Đổi trả miễn phí trong 30 ngày nếu không hài lòng</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💳</div>
            <h4>Trả Góp 0%</h4>
            <p>Hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng</p>
          </div>
        </div>
      </section>

      <section className="newsletter" id="newsletter">
        <div className="newsletter-content">
          <h2>Đăng Ký Nhận Tin</h2>
          <p>Nhận thông tin về sản phẩm mới và khuyến mãi độc quyền</p>
          <form
            className="newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const input = form.querySelector(
                'input[type="email"]',
              ) as HTMLInputElement;
              if (input?.value) {
                showNotification('Đăng ký thành công! Cảm ơn bạn.');
                input.value = '';
              }
            }}
          >
            <input type="email" placeholder="Nhập email của bạn..." />
            <button type="submit" className="btn btn-primary">
              Đăng ký
            </button>
          </form>
        </div>
      </section>

      <footer id="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="logo">
              LUXE<span>TIME</span>
            </Link>
            <p>
              Luxe Time - Hệ thống phân phối đồng hồ cao cấp chính hãng hàng đầu
              Việt Nam. Uy tín, chất lượng, dịch vụ hoàn hảo.
            </p>
            <div className="social-links">
              <a href="#">f</a>
              <a href="#">in</a>
              <a href="#">ig</a>
              <a href="#">yt</a>
            </div>
          </div>
          <div className="footer-links">
            <h4>Về chúng tôi</h4>
            <ul>
              <li>
                <a href="#">Giới thiệu</a>
              </li>
              <li>
                <a href="#">Hệ thống cửa hàng</a>
              </li>
              <li>
                <a href="#">Tuyển dụng</a>
              </li>
              <li>
                <a href="#">Liên hệ</a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Hỗ trợ</h4>
            <ul>
              <li>
                <a href="#">Hướng dẫn mua hàng</a>
              </li>
              <li>
                <a href="#">Chính sách bảo hành</a>
              </li>
              <li>
                <a href="#">Chính sách đổi trả</a>
              </li>
              <li>
                <a href="#">FAQ</a>
              </li>
            </ul>
          </div>
          <div className="footer-links">
            <h4>Liên hệ</h4>
            <ul>
              <li>📍 123 Nguyễn Huệ, Q.1, TP.HCM</li>
              <li>📞 1900 6868</li>
              <li>✉️ info@luxetime.vn</li>
              <li>🕐 8:00 - 22:00 hàng ngày</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Luxe Time. All rights reserved.</span>
          <div className="payment-methods">
            <span>VISA</span>
            <span>MasterCard</span>
            <span>JCB</span>
            <span>MoMo</span>
            <span>ZaloPay</span>
          </div>
        </div>
      </footer>

      {authModalOpen && (
        <div className="auth-modal" style={{ display: 'flex' }}>
          <div
            className="auth-modal__backdrop"
            role="presentation"
            onClick={() => setAuthModalOpen(false)}
          />
          <div className="auth-modal__box">
            <div className="auth-modal__tabs">
              <button
                type="button"
                className={`auth-tab ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthTab('login')}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                className={`auth-tab ${authTab === 'register' ? 'active' : ''}`}
                onClick={() => setAuthTab('register')}
              >
                Đăng ký
              </button>
            </div>
            <div className="auth-modal__content">
              {authTab === 'login' ? (
                <form
                  className="auth-form auth-form--login"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const btn = form.querySelector(
                      'button[type="submit"]',
                    ) as HTMLButtonElement;
                    const fd = new FormData(form);
                    const email = String(fd.get('email') || '').trim();
                    const password = String(fd.get('password') || '').trim();
                    if (!email || !password) return;
                    btn.disabled = true;
                    btn.textContent = 'Đang đăng nhập...';
                    try {
                      const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok)
                        throw new Error(
                          (data as { message?: string }).message ||
                            'Đăng nhập thất bại.',
                        );
                      saveAuth(
                        (data as { token: string }).token,
                        (data as { user: AuthUser }).user,
                      );
                      setAuthModalOpen(false);
                      alert('Đăng nhập thành công!');
                    } catch (err) {
                      alert(
                        err instanceof Error
                          ? err.message
                          : 'Có lỗi xảy ra. Vui lòng thử lại.',
                      );
                    } finally {
                      btn.disabled = false;
                      btn.textContent = 'Đăng nhập';
                    }
                  }}
                >
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="email@domain.com"
                    />
                  </label>
                  <label>
                    <span>Mật khẩu</span>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="********"
                    />
                  </label>
                  <div className="auth-form__actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setAuthModalOpen(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Đăng nhập
                    </button>
                  </div>
                </form>
              ) : (
                <form
                  className="auth-form auth-form--register"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const btn = form.querySelector(
                      'button[type="submit"]',
                    ) as HTMLButtonElement;
                    const fd = new FormData(form);
                    const name = String(fd.get('name') || '').trim();
                    const email = String(fd.get('email') || '').trim();
                    const password = String(fd.get('password') || '').trim();
                    if (!name || !email || !password) return;
                    btn.disabled = true;
                    btn.textContent = 'Đang đăng ký...';
                    try {
                      const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name, email, password }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok)
                        throw new Error(
                          (data as { message?: string }).message ||
                            'Đăng ký thất bại.',
                        );
                      saveAuth(
                        (data as { token: string }).token,
                        (data as { user: AuthUser }).user,
                      );
                      setAuthModalOpen(false);
                      alert('Đăng ký & đăng nhập thành công!');
                    } catch (err) {
                      alert(
                        err instanceof Error
                          ? err.message
                          : 'Có lỗi xảy ra. Vui lòng thử lại.',
                      );
                    } finally {
                      btn.disabled = false;
                      btn.textContent = 'Đăng ký';
                    }
                  }}
                >
                  <label>
                    <span>Họ tên</span>
                    <input
                      type="text"
                      name="name"
                      required
                      placeholder="Nguyễn Văn A"
                    />
                  </label>
                  <label>
                    <span>Email</span>
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="email@domain.com"
                    />
                  </label>
                  <label>
                    <span>Mật khẩu</span>
                    <input
                      type="password"
                      name="password"
                      required
                      placeholder="********"
                    />
                  </label>
                  <div className="auth-form__actions">
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => setAuthModalOpen(false)}
                    >
                      Hủy
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Đăng ký
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
