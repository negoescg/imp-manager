export interface VariantDetail {
  sku: string;
  description: string;
  required: number;
  isBespoke: boolean;
  type: string;
  completed: number;
  took_from_stock: number;
  id: number;
}

export interface ProductDetail {
  name: string;
  sku?: string;
  required?: number;
  type?: string;
  variants?: VariantDetail[];
  isBespoke: boolean;
  completed?: number;
  took_from_stock?: number;
}

export interface CategoryDetail {
  [categoryName: string]: ProductDetail[];
}

export interface VariantCell {
  sku: string;
  required: number;
  completed: number;
  stock: number;
}
