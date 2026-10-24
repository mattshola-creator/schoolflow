type PaymentStatus = "recorded" | "verified" | "rejected" | "reversed";

function toMinorUnits(value: number | string) {
  const normalized = String(value).trim();
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(normalized);
  if (!match) return BigInt(0);
  return (
    BigInt(match[1]) * BigInt(100) + BigInt((match[2] ?? "").padEnd(2, "0"))
  );
}

export function sumMoneyAmounts(values: Array<number | string>) {
  const hundred = BigInt(100);
  const total = values.reduce(
    (sum, value) => sum + toMinorUnits(value),
    BigInt(0),
  );
  return `${total / hundred}.${String(total % hundred).padStart(2, "0")}`;
}

export function paymentStatusLabel(status: string) {
  switch (status as PaymentStatus) {
    case "recorded":
      return "Pending verification";
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
    case "reversed":
      return "Reversed";
    default:
      return status.replaceAll("_", " ");
  }
}

export function paymentAllocationLabel(
  status: string,
  amount: number | string,
  allocatedAmount: number | string,
) {
  const allocated = toMinorUnits(allocatedAmount);
  if (status === "reversed")
    return allocated > BigInt(0)
      ? "Prior allocation retained in history"
      : null;
  if (status !== "verified") return null;
  if (allocated === BigInt(0)) return "Not allocated";
  return allocated >= toMinorUnits(amount)
    ? "Fully allocated"
    : "Partially allocated";
}

export function paymentRegisterStatus(value?: string) {
  return ["recorded", "verified", "rejected", "reversed"].find(
    (status) => status === value,
  );
}
export function canIndependentlyVerifyPayment(
  payment: { status: string; recorded_by: string },
  actorId: string,
  permitted: boolean,
) {
  return (
    permitted &&
    payment.status === "recorded" &&
    payment.recorded_by !== actorId
  );
}
