export type StaffUser = {
  id: number;
  email: string;
  name: string;
  is_superuser: boolean;
};

export type StaffCsrfResponse = {
  csrf_token: string;
};

export type StaffLoginRequest = {
  email: string;
  password: string;
};

export type StaffLoginResponse = {
  message: string;
  csrf_token: string;
  user: StaffUser;
};

export type BookingStatus =
  | "received"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "completed"
  | "cancelled";

export type StaffBookingItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  product_slug: string;
  product_image: string;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type StaffBooking = {
  reference: string;
  status: BookingStatus;
  status_label: string;
  status_message: string;
  customer_name: string;
  phone_number: string;
  delivery_location: string;
  customer_note: string;
  admin_notes: string;
  currency: string;
  estimated_total: string;
  confirmed_total: string | null;
  display_total: string;
  total_items: number;
  confirmed_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  items: StaffBookingItem[];
};

export type StaffBookingUpdateRequest = {
  status: BookingStatus;
  confirmed_total?: string;
  status_message?: string;
  admin_notes?: string;
};

export type StaffBookingUpdateResponse = {
  message: string;
  booking: StaffBooking;
};

export type PaginatedStaffBookings = {
  count: number;
  next: string | null;
  previous: string | null;
  results: StaffBooking[];
};

export type PaymentMethod =
  | "mpesa"
  | "cash"
  | "bank_transfer"
  | "card"
  | "other";

export type ReceiptItemSnapshot = {
  product_id: number | null;
  product_name: string;
  product_slug: string;
  quantity: number;
  unit_price: string;
  line_total: string;
};

export type StaffReceipt = {
  receipt_number: string;
  public_token: string;
  receipt_url: string;
  booking_reference: string;
  customer_name: string;
  phone_number: string;
  delivery_location: string;
  currency: string;
  subtotal: string;
  delivery_fee: string;
  discount: string;
  price_adjustment: string;
  total_paid: string;
  balance: string;
  payment_method: PaymentMethod;
  payment_method_label: string;
  transaction_reference: string;
  items_snapshot: ReceiptItemSnapshot[];
  issued_at: string;
};

export type IssueReceiptRequest = {
  payment_method: PaymentMethod;
  amount_paid: string;
  transaction_reference: string;
  payment_note: string;
};

export type IssueReceiptResponse = {
  message: string;
  created: boolean;
  receipt: StaffReceipt;
};