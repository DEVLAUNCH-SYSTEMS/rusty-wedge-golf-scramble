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
    <label className="flex w-full min-w-0 flex-col gap-1 lg:w-auto">
      <AdminTournamentSelectorLabel />
      <select
        aria-label="Select tournament view"
        value={props.selectedTournamentId}
        disabled={props.disabled}
        className={`${adminInputClassName} w-full max-w-full border-white/20 bg-white/10 text-white lg:max-w-xs xl:max-w-sm`}
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
