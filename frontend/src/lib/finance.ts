import { apiProxyTarget } from "@/lib/apiBase";
import { DateFormat } from "@/types/user.type";

export function monthKey(date: DateFormat): string {
  return `${date.year}-${date.month.toString().padStart(2, "0")}`;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
}

export const CATEGORIES = [
  "groceries",
  "rent",
  "food",
  "travel",
  "salary",
  "utilities",
  "entertainment",
  "subscriptions",
  "shopping",
  "health",
  "miscellaneous",
];

export function startOAuth(provider: "google" | "github") {
  // The provider sends the browser back to the API host, so this navigation
  // has to start there too. The session cookie for that hop lives on the API.
  window.location.href = `${apiProxyTarget()}/api/v1/auth/oauth/${provider}`;
}

export function errorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "status" in error) {
    const status = (error as { status?: number }).status;
    if (status === 401) return "";
  }
  if (error && typeof error === "object" && "data" in error) {
    const detail = (error as { data?: { detail?: unknown } }).data?.detail;
    if (typeof detail === "string") return detail;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
