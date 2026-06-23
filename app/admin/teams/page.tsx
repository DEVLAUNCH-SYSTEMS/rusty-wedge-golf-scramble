import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";

export default function AdminTeamsPage() {
  return (
    <section className={adminCardClassName}>
      <h1 className={adminPageHeadingClassName}>Teams</h1>
      <p className={adminPageSubheadingClassName}>
        Team creation and player assignment will be added in a later phase.
      </p>
    </section>
  );
}
