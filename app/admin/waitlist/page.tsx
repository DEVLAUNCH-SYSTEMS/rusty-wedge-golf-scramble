import { adminCardClassName } from "@/components/admin/admin-form-styles";
import {
  adminPageHeadingClassName,
  adminPageSubheadingClassName,
} from "@/components/admin/admin-text-styles";

export default function AdminWaitlistPage() {
  return (
    <section className={adminCardClassName}>
      <h1 className={adminPageHeadingClassName}>Waitlist</h1>
      <p className={adminPageSubheadingClassName}>
        Waitlist promotion and removal tools will be added in a later phase.
      </p>
    </section>
  );
}
