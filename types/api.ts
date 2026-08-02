export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ApiErrorResponse = {
  detail?: string;
  message?: string;
  unavailable_product_ids?: number[];
};