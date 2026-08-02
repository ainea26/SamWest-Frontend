const currencyFormatter = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function toNumber(
  value: string | number | null | undefined,
): number {
  if (value === null || value === undefined || value === "") {
    return 0;
  }

  const parsedValue =
    typeof value === "number"
      ? value
      : Number.parseFloat(value.replace(/,/g, ""));

  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

export function formatCurrency(
  value: string | number | null | undefined,
): string {
  return currencyFormatter.format(toNumber(value));
}

export function calculateDiscountPercentage(
  price: string | number,
  oldPrice: string | number | null | undefined,
): number {
  const currentPrice = toNumber(price);
  const previousPrice = toNumber(oldPrice);

  if (
    previousPrice <= 0 ||
    currentPrice <= 0 ||
    currentPrice >= previousPrice
  ) {
    return 0;
  }

  return Math.round(
    ((previousPrice - currentPrice) / previousPrice) * 100,
  );
}

export function truncateText(
  value: string,
  maximumLength = 80,
): string {
  if (value.length <= maximumLength) {
    return value;
  }

  return `${value.slice(0, maximumLength).trimEnd()}…`;
}

export function formatProductQuantity(
  quantity: string | null | undefined,
): string {
  return quantity?.trim() || "Standard size";
}