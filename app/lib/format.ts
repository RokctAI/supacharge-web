/**
 * Host-owned formatting helpers. Named in lms_sdk's manifest `requires`
 * (`formatDate` for the handson lms pages: review, discussion and batch
 * dates, certificate issue dates).
 *
 * Mirrors RokctAI/rokctai_frontend's `app/lib/format.ts` as it stood before
 * that shell dropped its paas tree (#134), minus the lending-module framing:
 * `en-ZA` is simply this product's locale, and ZAR its default currency.
 */
export function formatCurrency(
  amount: number | undefined | null,
  currency = "ZAR",
): string {
  if (amount === undefined || amount === null) return "R 0.00";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
