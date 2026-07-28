import { adminBreakableTextClassName, adminMutedTextClassName } from "@/components/admin/admin-text-styles";

type AdminPlayerContactProps = {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  nameClassName?: string;
};

export function AdminPlayerContact({
  firstName,
  lastName,
  email,
  phone,
  nameClassName = "font-medium text-rw-navy",
}: AdminPlayerContactProps) {
  return (
    <>
      <p className={nameClassName}>
        {firstName} {lastName}
      </p>
      <p className={`${adminMutedTextClassName} ${adminBreakableTextClassName}`}>
        {email}
      </p>
      {phone ? <p className={adminMutedTextClassName}>{phone}</p> : null}
    </>
  );
}
