import type { NextRequest } from 'next/server';
import type { Order, OrderItem, Product, User } from '@/lib/types';
import productsSeed from '@/data/products.json';

/** Base URL cho ảnh relative (giống SHOP_PUBLIC_URL / Express). */
export function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'localhost:3000';
  const forwardedProto = request.headers.get('x-forwarded-proto');
  const proto =
    forwardedProto || (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

function toFullImageUrl(url: string, baseUrl: string): string {
  if (!url || typeof url !== 'string') return url;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return baseUrl + (url.startsWith('/') ? url : `/${url}`);
}

function normalizeProduct(p: Product, baseUrl: string): Product {
  return {
    ...p,
    images: (p.images || []).map((u) => toFullImageUrl(u, baseUrl)),
  };
}

const rawProducts: Product[] = productsSeed as Product[];

const initialUsers: User[] = [
  {
    id: 1,
    name: 'Demo User',
    email: 'demo@example.com',
    password: '123456',
  },
];

function createToken(): string {
  return (
    'tok_' +
    Math.random().toString(36).slice(2) +
    Math.random().toString(36).slice(2) +
    Date.now().toString(36)
  );
}

/** Mock DB in-memory (phù hợp Vercel; không ghi file). */
const sessions: Record<string, { userId: number }> = {};

const users: User[] = [...initialUsers];
let nextUserId =
  users.reduce(
    (maxId, u) => (typeof u.id === 'number' && u.id > maxId ? u.id : maxId),
    0,
  ) + 1;

const orders: Order[] = [];

export const shopStore = {
  getProducts(baseUrl: string): Product[] {
    return rawProducts.map((p) => normalizeProduct(p, baseUrl));
  },

  getBrands(baseUrl: string): string[] {
    const products = this.getProducts(baseUrl);
    return [...new Set(products.map((p) => p.brand))];
  },

  filterProducts(
    baseUrl: string,
    query: Record<string, string | null>,
  ): Product[] {
    let result = [...this.getProducts(baseUrl)];
    const { brand, gender, movement, minPrice, maxPrice, search } = query;

    if (brand) {
      result = result.filter(
        (p) => p.brand.toLowerCase() === String(brand).toLowerCase(),
      );
    }
    if (gender) {
      result = result.filter(
        (p) => p.gender.toLowerCase() === String(gender).toLowerCase(),
      );
    }
    if (movement) {
      result = result.filter(
        (p) => p.movement.toLowerCase() === String(movement).toLowerCase(),
      );
    }
    if (minPrice) {
      const min = Number(minPrice);
      result = result.filter((p) => p.price >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      result = result.filter((p) => p.price <= max);
    }
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q),
      );
    }
    return result;
  },

  getHot(baseUrl: string, limit: number): Product[] {
    const products = this.getProducts(baseUrl);
    return products
      .filter((p) => p.isHot === true || (p.stock > 0 && p.stock <= 5))
      .slice(0, limit);
  },

  getBySlug(baseUrl: string, slug: string): Product | undefined {
    return this.getProducts(baseUrl).find((p) => p.slug === slug);
  },

  getById(baseUrl: string, id: number): Product | undefined {
    return this.getProducts(baseUrl).find((p) => p.id === id);
  },

  getSimilar(baseUrl: string, slug: string, limit: number): Product[] {
    const products = this.getProducts(baseUrl);
    const product = products.find((p) => p.slug === slug);
    if (!product) return [];

    type Scored = Product & { score: number };
    const scored: Scored[] = products
      .filter((p) => p.slug !== slug)
      .map((p) => ({
        ...p,
        score:
          (p.brand === product.brand ? 2 : 0) +
          (p.gender === product.gender ? 1 : 0) +
          (Math.abs(p.price - product.price) <= product.price * 0.5 ? 1 : 0),
      }))
      .filter((p) => p.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scored.map((item) => {
      const { score, ...rest } = item;
      void score;
      return rest;
    });
  },

  register(body: {
    name?: string;
    email?: string;
    password?: string;
  }): { ok: true; token: string; user: Omit<User, 'password'> } | { ok: false; status: number; message: string } {
    const { name, email, password } = body || {};
    if (!name || !email || !password) {
      return {
        ok: false,
        status: 400,
        message: 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.',
      };
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    if (users.find((u) => u.email === normalizedEmail)) {
      return {
        ok: false,
        status: 400,
        message: 'Email đã được đăng ký. Vui lòng dùng email khác.',
      };
    }
    const user: User = {
      id: nextUserId++,
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
    };
    users.push(user);
    const token = createToken();
    sessions[token] = { userId: user.id };
    return {
      ok: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  login(body: {
    email?: string;
    password?: string;
  }): { ok: true; token: string; user: Omit<User, 'password'> } | { ok: false; status: number; message: string } {
    const { email, password } = body || {};
    if (!email || !password) {
      return {
        ok: false,
        status: 400,
        message: 'Vui lòng nhập email và mật khẩu.',
      };
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = users.find(
      (u) =>
        u.email === normalizedEmail && u.password === String(password),
    );
    if (!user) {
      return {
        ok: false,
        status: 401,
        message: 'Email hoặc mật khẩu không chính xác.',
      };
    }
    const token = createToken();
    sessions[token] = { userId: user.id };
    return {
      ok: true,
      token,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  getMe(
    authHeader: string | null,
  ): { ok: true; user: Omit<User, 'password'> } | { ok: false; status: number; message: string } {
    const user = this.getUserFromAuth(authHeader);
    if (!user) {
      return {
        ok: false,
        status: 401,
        message: 'Chưa đăng nhập hoặc token không hợp lệ.',
      };
    }
    return {
      ok: true,
      user: { id: user.id, name: user.name, email: user.email },
    };
  },

  getUserFromAuth(authHeader: string | null): User | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
    const token = authHeader.slice('Bearer '.length).trim();
    if (!token || !sessions[token]) return null;
    const session = sessions[token];
    return users.find((u) => u.id === session.userId) ?? null;
  },

  createOrder(
    baseUrl: string,
    body: {
      customerName?: string;
      phone?: string;
      address?: string;
      items?: { productId: number; quantity?: number }[];
    },
    authHeader: string | null,
  ):
    | { ok: true; order: Order }
    | { ok: false; status: number; message: string } {
    const { customerName, phone, address, items } = body || {};
    if (
      !customerName ||
      !phone ||
      !address ||
      !Array.isArray(items) ||
      !items.length
    ) {
      return { ok: false, status: 400, message: 'Thiếu thông tin đơn hàng.' };
    }

    const products = this.getProducts(baseUrl);
    const detailedItems: OrderItem[] = [];
    let totalPrice = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) continue;
      const quantity = Number(item.quantity) || 1;
      const lineTotal = product.price * quantity;
      totalPrice += lineTotal;
      detailedItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
        lineTotal,
      });
    }

    const user = this.getUserFromAuth(authHeader);
    const order: Order = {
      id: orders.length + 1,
      customerName,
      phone,
      address,
      items: detailedItems,
      totalPrice,
      createdAt: new Date().toISOString(),
      userId: user ? user.id : null,
    };
    orders.push(order);
    return { ok: true, order };
  },

  listOrders(): Order[] {
    return orders;
  },

  myOrders(authHeader: string | null):
    | { ok: true; orders: Order[] }
    | { ok: false; status: number; message: string } {
    const user = this.getUserFromAuth(authHeader);
    if (!user) {
      return { ok: false, status: 401, message: 'Chưa đăng nhập.' };
    }
    return {
      ok: true,
      orders: orders.filter((o) => o.userId === user.id),
    };
  },
};
