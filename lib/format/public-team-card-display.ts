import { formatFinishingPlacementLabel } from "@/lib/format/finishing-placement-display";

export function formatPublicResultsPlacementHeading(placement: number): string {
  return `${formatFinishingPlacementLabel(placement)} Place`;
}
