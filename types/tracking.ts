export type BookingStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type BookingTrackingItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  product_slug: string;
  product_image: string;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type BookingTracking = {
  reference: string;
  status: BookingStatus;
  status_label: string;
  status_message: string;
  delivery_location: string;
  currency: "KES";
  estimated_total: string;
  confirmed_total: string | null;
  display_total: string;
  total_items: number;
  is_final: boolean;
  confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  items: BookingTrackingItem[];
};