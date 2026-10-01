export function addMoney(values: string[]) {
  const cents = values.reduce((sum, value) => {
    const negative = value.startsWith("-");
    const [whole = "0", fraction = ""] = value.replace("-", "").split(".");
    const amount =
      BigInt(whole || "0") * BigInt(100) +
      BigInt((fraction + "00").slice(0, 2));
    return sum + (negative ? -amount : amount);
  }, BigInt(0));
  const negative = cents < BigInt(0);
  const absolute = negative ? -cents : cents;
  return `${negative ? "-" : ""}${absolute / BigInt(100)}.${(
    absolute % BigInt(100)
  )
    .toString()
    .padStart(2, "0")}`;
}

export function formatNgn(value: string) {
  const [whole = "0", fraction = "00"] = value.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `₦${grouped}.${(fraction + "00").slice(0, 2)}`;
}

export function attendanceRate(present: number, entries: number) {
  return entries === 0 ? "—" : `${((present * 100) / entries).toFixed(1)}%`;
}
