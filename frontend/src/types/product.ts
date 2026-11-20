
export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: number | string;
  stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductCreate {
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock_quantity: number;
}

export interface ProductUpdate {
  sku?: string;
  name?: string;
  description?: string | null;
  price?: number;
  stock_quantity?: number;
  is_active?: boolean;
}
