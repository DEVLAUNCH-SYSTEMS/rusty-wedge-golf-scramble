import { adminInputClassName } from "@/components/admin/admin-form-styles";
import { AdminTournamentSelectorOptions } from "@/components/admin/admin-tournament-selector-options";

import type { AdminTournamentListItem } from "@/lib/services/admin-tournament-list";

function AdminTournamentSelectorLabel() {
  return (
    <span className="text-xs font-medium uppercase tracking-wide text-white/70">
      Tournament view
    </span>
  );
}

type AdminTournamentSelectorFieldProps = {
  options: AdminTournamentListItem[];
  selectedTournamentId: string;
  activeTournamentId: string | null;
  disabled: boolean;
  onChange: (tournamentId: string) => void;
};

export function AdminTournamentSelectorField(props: AdminTournamentSelectorFieldProps) {
  return (
    <label className="flex flex-col gap-1">
      <AdminTournamentSelectorLabel />
      <select
        aria-label="Select tournament view"
        value={props.selectedTournamentId}
        disabled={props.disabled}
        className={`${adminInputClassName} min-w-[14rem] border-white/20 bg-white/10 text-white`}
        onChange={(event) => props.onChange(event.target.value)}
      >
        <AdminTournamentSelectorOptions
          options={props.options}
          activeTournamentId={props.activeTournamentId}
        />
      </select>
    </label>
  );
}
