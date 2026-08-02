import { PaginatedResponse } from "./api";



export type ProductImage = {
  id: number;
  image: string;
  image_url?: string | null;
  position: number;
  alt_text: string;
};

export type Product = {
  id: number;
  external_id?: string | null;
  name: string;
  slug: string;

  category: number | null;
  category_name: string | null;
  category_slug: string | null;

  brand: number | null;
  brand_name: string | null;
  brand_slug: string | null;

  quantity: string;
  price: string;
  old_price: string | null;
  discount_percentage?: number;

  image: string | null;
  image_url: string | null;
  images?: ProductImage[];

  description: string;
  ingredients?: string;
  country?: string;
  source?: string;

  is_available: boolean;
  is_featured: boolean;

  views?: number;
  orders_count?: number;

  created_at?: string;
  updated_at?: string;
};

export type ProductListResponse =
  | Product[]
  | PaginatedResponse<Product>;

export type HomepageProducts = {
  featured: Product[];
  deals: Product[];
  popular: Product[];
  new_arrivals: Product[];
};

export type ProductQueryParams = {
  page?: number;
  page_size?: number;
  search?: string;
  category?: string;
  brand?: string;
  ordering?: string;
  is_featured?: boolean;
  is_available?: boolean;
  min_price?: number;
  max_price?: number;
};