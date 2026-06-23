type FormMessageProps = {
  tone: "success" | "error";
  message: string;
};

export function FormMessage({ tone, message }: FormMessageProps) {
  const className =
    tone === "success"
      ? "rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
      : "rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900";

  return (
    <p className={className} role={tone === "error" ? "alert" : "status"}>
      {message}
    </p>
  );
}
