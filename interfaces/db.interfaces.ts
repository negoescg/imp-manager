export interface User {
  id: number;
  email: string;
  username: string;
  password: string;
  role: string;
}

export interface ItemType {
  type_id: number;
  type_name: string;
}

export interface UnitOfMeasure {
  unit_id: number;
  unit_name: string;
}

export interface Category {
  category_id: number;
  category_name: string;
}

export interface TransactionType {
  transaction_type_id: number;
  transaction_type_name: string;
}

export interface InventoryItem {
  item_id: number;
  item_name: string | null;
  item_type_id: number | null;
  unit_of_measure_id: number | null;
}

export interface FinalProduct {
  product_id: number;
  sku: string;
  category_id: number;
  production_cost: number;
  retail_price: number;
}

export interface ProductComposition {
  composition_id: number;
  product_id: number;
  item_id: number;
  quantity_required: number;
}

export interface InventoryTransaction {
  transaction_id: number;
  item_id: number;
  transaction_type_id: number;
  date: Date;
  quantity: number;
  price_per_unit: number;
}

export interface ProductionHistory {
  production_id: number;
  product_id: number;
  date_produced: Date;
  quantity_produced: number;
}

export interface DetailedInventoryItem {
  item: InventoryItem;
  itemType: ItemType;
  unitOfMeasure: UnitOfMeasure;
}
