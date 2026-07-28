import { adminTableHeadClassName } from "@/components/admin/admin-text-styles";

function TeamMembersTableHead() {
  return (
    <thead className={adminTableHeadClassName}>
      <tr>
        <th className="px-4 py-3 font-medium">Player</th>
        <th className="px-4 py-3 font-medium">Skill</th>
        <th className="px-4 py-3 font-medium text-right">Actions</th>
      </tr>
    </thead>
  );
}

export { TeamMembersTableHead };
