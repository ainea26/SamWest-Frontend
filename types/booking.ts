import type { Product } from "@/types/product";

export type BookingItem = {
  product: Product;
  quantity: number;
};

export type WhatsAppBookingItemRequest = {
  product_id: number;
  quantity: number;
};

export type WhatsAppBookingRequest = {
  items: WhatsAppBookingItemRequest[];
  customer_name: string;
  phone: string;
  delivery_location: string;
  notes?: string;
};

export type WhatsAppBookingResponseItem = {
  id: number;
  name: string;
  slug: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  image: string | null;
};

export type WhatsAppBookingResponse = {
  message: string;
  booking_reference: string;
  tracking_token: string;
  tracking_url: string;
  status: string;
  status_label: string;
  whatsapp_url: string;
  total_items: number;
  estimated_total: string;
  currency: string;
  items: WhatsAppBookingResponseItem[];
};