import axios, {
  AxiosError,
  type AxiosRequestConfig,
} from "axios";

import type { ApiErrorResponse, PaginatedResponse } from "@/types/api";
import type {
  WhatsAppBookingRequest,
  WhatsAppBookingResponse,
} from "@/types/booking";
import type {
  Category,
  CategoryListResponse,
} from "@/types/category";
import type {
  HomepageProducts,
  Product,
  ProductListResponse,
  ProductQueryParams,
} from "@/types/product";
import { BookingTracking } from "@/types/tracking";

const LOCAL_API_URL =
  "http://127.0.0.1:8001/api";

const PRODUCTION_API_URL =
  "https://samwest-production.up.railway.app/api";

const configuredApiUrl =
  process.env.API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim();

export const API_BASE_URL = (
  configuredApiUrl ||
  (process.env.NODE_ENV === "production"
    ? PRODUCTION_API_URL
    : LOCAL_API_URL)
).replace(/\/+$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export default api;

export function getApiErrorMessage(
  error: unknown,
  fallbackMessage = "Something went wrong. Please try again.",
): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export function isApiError(
  error: unknown,
): error is AxiosError<ApiErrorResponse> {
  return axios.isAxiosError<ApiErrorResponse>(error);
}

export function unwrapResults<T>(
  response: T[] | PaginatedResponse<T>,
): T[] {
  return Array.isArray(response) ? response : response.results;
}

export async function getProducts(
  params: ProductQueryParams = {},
  config?: AxiosRequestConfig,
): Promise<ProductListResponse> {
  const response = await api.get<ProductListResponse>(
    "/products/",
    {
      ...config,
      params: {
        ...config?.params,
        ...params,
      },
    },
  );

  return response.data;
}

export async function getProduct(
  slug: string,
  config?: AxiosRequestConfig,
): Promise<Product> {
  const response = await api.get<Product>(
    `/products/${encodeURIComponent(slug)}/`,
    config,
  );

  return response.data;
}

export async function getHomepageProducts(
  limit = 8,
  config?: AxiosRequestConfig,
): Promise<HomepageProducts> {
  const response = await api.get<HomepageProducts>(
    "/products/homepage/",
    {
      ...config,
      params: {
        ...config?.params,
        limit,
      },
    },
  );

  return response.data;
}

export async function getCategories(
  config?: AxiosRequestConfig,
): Promise<CategoryListResponse> {
  const response = await api.get<CategoryListResponse>(
    "/categories/",
    config,
  );

  return response.data;
}

export async function getCategory(
  slug: string,
  config?: AxiosRequestConfig,
): Promise<Category> {
  const response = await api.get<Category>(
    `/categories/${encodeURIComponent(slug)}/`,
    config,
  );

  return response.data;
}

export async function createWhatsAppBooking(
  data: WhatsAppBookingRequest,
): Promise<WhatsAppBookingResponse> {
  const response = await api.post<WhatsAppBookingResponse>(
    "/products/whatsapp-booking/",
    data,
  );

  return response.data;
}


export async function getBookingTracking(
  reference: string,
  token: string,
  config?: AxiosRequestConfig,
): Promise<BookingTracking> {
  const response = await api.get<BookingTracking>(
    `/orders/track/${encodeURIComponent(reference)}/`,
    {
      ...config,
      params: {
        ...config?.params,
        token,
      },
    },
  );

  return response.data;
}