import { adminInputClassName } from "@/components/admin/admin-form-styles";
import { BulkScoreStrokesInput } from "@/components/admin/bulk-results-score-inputs";
import { ScoreRelativeToParInput } from "@/components/admin/score-relative-to-par-input";

import type { AdminTeamListItem } from "@/lib/services/admin-teams-list";

function bulkScoreInputClassName(): string {
  return `${adminInputClassName} max-w-24`;
}

export function BulkResultsScoreCells({ team }: { team: AdminTeamListItem }) {
  const teamLabel = team.teamNumber == null ? "team" : `Team #${team.teamNumber}`;

  return (
    <>
      <td className="px-4 py-3 align-top">
        <ScoreRelativeToParInput
          name={`scoreRelativeToPar_${team.id}`}
          scoreRelativeToPar={team.scoreRelativeToPar}
          ariaLabel={`Relative to par for ${teamLabel}`}
          className={bulkScoreInputClassName()}
        />
      </td>
      <td className="px-4 py-3 align-top">
        <BulkScoreStrokesInput
          teamId={team.id}
          teamNumber={team.teamNumber}
          scoreTotalStrokes={team.scoreTotalStrokes}
        />
      </td>
    </>
  );
}
