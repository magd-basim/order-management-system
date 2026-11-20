export type OrderStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
}

export interface Order {
  id: number;
  customer_name: string;
  customer_email: string;
  status: OrderStatus;
  total_amount: number | string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItemCreate {
  product_id: number;
  quantity: number;
}

export interface OrderCreate {
  customer_name: string;
  customer_email: string;
  items: OrderItemCreate[];
}
