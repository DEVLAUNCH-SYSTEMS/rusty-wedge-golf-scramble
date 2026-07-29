type AdminMobileListFieldProps = {
  label: string;
  children: React.ReactNode;
};

export function AdminMobileListField({ label, children }: AdminMobileListFieldProps) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <div className="mt-1 text-sm text-rw-navy">{children}</div>
    </div>
  );
}
