export type Product = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  price: number;
  gender: string;
  movement: string;
  waterResistance?: string;
  description?: string;
  images: string[];
  stock: number;
  isHot?: boolean;
};

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

export type OrderItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
};

export type Order = {
  id: number;
  customerName: string;
  phone: string;
  address: string;
  items: OrderItem[];
  totalPrice: number;
  createdAt: string;
  userId: number | null;
};
