import axios from "axios";

import type {
  BookingStatus,
  IssueReceiptRequest,
  IssueReceiptResponse,
  PaginatedStaffBookings,
  StaffBooking,
  StaffBookingUpdateRequest,
  StaffBookingUpdateResponse,
  StaffCsrfResponse,
  StaffLoginRequest,
  StaffLoginResponse,
  StaffReceipt,
  StaffUser,
} from "@/types/staff";

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8001/api";

const CSRF_STORAGE_KEY =
  "samwest-staff-csrf";

const staffApi = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

function saveCsrfToken(
  token: string,
): void {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  sessionStorage.setItem(
    CSRF_STORAGE_KEY,
    token,
  );
}

export function getSavedCsrfToken(): string {
  if (
    typeof window === "undefined"
  ) {
    return "";
  }

  return (
    sessionStorage.getItem(
      CSRF_STORAGE_KEY,
    ) ?? ""
  );
}

export async function prepareStaffCsrf(): Promise<string> {
  const response =
    await staffApi.get<StaffCsrfResponse>(
      "/staff/csrf/",
    );

  saveCsrfToken(
    response.data.csrf_token,
  );

  return response.data.csrf_token;
}

export async function loginStaff(
  credentials: StaffLoginRequest,
): Promise<StaffLoginResponse> {
  await prepareStaffCsrf();

  const response =
    await staffApi.post<StaffLoginResponse>(
      "/staff/login/",
      credentials,
    );

  saveCsrfToken(
    response.data.csrf_token,
  );

  return response.data;
}

export async function getStaffAccount(): Promise<StaffUser> {
  const response =
    await staffApi.get<StaffUser>(
      "/staff/me/",
    );

  return response.data;
}

type GetStaffBookingsOptions = {
  search?: string;
  status?: BookingStatus | "";
};

export async function getStaffBookings(
  options: GetStaffBookingsOptions = {},
): Promise<StaffBooking[]> {
  const response = await staffApi.get<
    StaffBooking[] |
      PaginatedStaffBookings
  >("/staff/bookings/", {
    params: {
      search:
        options.search || undefined,

      status:
        options.status || undefined,
    },
  });

  if (
    Array.isArray(response.data)
  ) {
    return response.data;
  }

  return response.data.results;
}

export async function updateStaffBooking(
  reference: string,
  data: StaffBookingUpdateRequest,
): Promise<StaffBookingUpdateResponse> {
  const csrfToken =
    await prepareStaffCsrf();

  const response =
    await staffApi.post<StaffBookingUpdateResponse>(
      `/staff/bookings/${encodeURIComponent(
        reference,
      )}/status/`,
      data,
      {
        headers: {
          "X-CSRFToken":
            csrfToken,
        },
      },
    );

  return response.data;
}

export async function getStaffBookingReceipt(
  reference: string,
): Promise<StaffReceipt | null> {
  try {
    const response =
      await staffApi.get<StaffReceipt>(
        `/staff/bookings/${encodeURIComponent(
          reference,
        )}/receipt/`,
      );

    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(
        error,
      ) &&
      error.response?.status ===
        404
    ) {
      return null;
    }

    throw error;
  }
}

export async function issueStaffBookingReceipt(
  reference: string,
  data: IssueReceiptRequest,
): Promise<IssueReceiptResponse> {
  const csrfToken =
    await prepareStaffCsrf();

  const response =
    await staffApi.post<IssueReceiptResponse>(
      `/staff/bookings/${encodeURIComponent(
        reference,
      )}/receipt/`,
      data,
      {
        headers: {
          "X-CSRFToken":
            csrfToken,
        },
      },
    );

  return response.data;
}

export async function getPublicReceipt(
  receiptNumber: string,
  token: string,
): Promise<StaffReceipt> {
  const response =
    await staffApi.get<StaffReceipt>(
      `/orders/receipts/${encodeURIComponent(
        receiptNumber,
      )}/`,
      {
        params: {
          token,
        },
      },
    );

  return response.data;
}

export async function logoutStaff(): Promise<void> {
  const csrfToken =
    await prepareStaffCsrf();

  await staffApi.post(
    "/staff/logout/",
    {},
    {
      headers: {
        "X-CSRFToken":
          csrfToken,
      },
    },
  );

  if (
    typeof window !== "undefined"
  ) {
    sessionStorage.removeItem(
      CSRF_STORAGE_KEY,
    );
  }
}

function extractValidationMessage(
  value: unknown,
): string | null {
  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    for (
      const item of value
    ) {
      const message =
        extractValidationMessage(
          item,
        );

      if (message) {
        return message;
      }
    }
  }

  if (
    value &&
    typeof value === "object"
  ) {
    for (
      const nestedValue
      of Object.values(value)
    ) {
      const message =
        extractValidationMessage(
          nestedValue,
        );

      if (message) {
        return message;
      }
    }
  }

  return null;
}

export function getStaffErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (
    !axios.isAxiosError(
      error,
    )
  ) {
    return fallback;
  }

  return (
    extractValidationMessage(
      error.response?.data,
    ) ?? fallback
  );
}

export default staffApi;