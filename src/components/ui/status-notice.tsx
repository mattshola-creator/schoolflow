type StatusNoticeProps = {
  children: React.ReactNode;
  tone: "error" | "success";
};

export function StatusNotice({ children, tone }: StatusNoticeProps) {
  const isError = tone === "error";

  return (
    <p
      role={isError ? "alert" : "status"}
      className={`rounded-lg p-3 text-sm ${
        isError ? "bg-red-50 text-red-900" : "bg-emerald-50 text-emerald-900"
      }`}
    >
      {children}
    </p>
  );
}
