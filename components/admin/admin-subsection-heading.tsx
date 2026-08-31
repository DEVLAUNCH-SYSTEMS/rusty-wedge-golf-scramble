import { adminSectionTitleClassName } from "@/components/admin/admin-text-styles";

export function AdminSubsectionHeading({ children }: { children: string }) {
  return <h2 className={`${adminSectionTitleClassName} text-base`}>{children}</h2>;
}
