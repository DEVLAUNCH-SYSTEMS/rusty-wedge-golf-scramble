import { adminCardClassName } from "@/components/admin/admin-form-styles";

type AdminTableScrollShellProps = {
  children: React.ReactNode;
  className?: string;
};

export function AdminTableScrollShell({
  children,
  className = "",
}: AdminTableScrollShellProps) {
  return (
    <div className={`${adminCardClassName} min-w-0 p-0 ${className}`.trim()}>
      <p className="hidden border-b border-slate-200 px-4 py-2 text-xs text-slate-500 min-[1100px]:block">
        Swipe horizontally to see all columns.
      </p>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
