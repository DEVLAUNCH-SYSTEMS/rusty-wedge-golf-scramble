function ordinalSuffix(value: number): string {
  const mod100 = value % 100;

  if (mod100 >= 11 && mod100 <= 13) {
    return "th";
  }

  switch (value % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function formatFinishingPlacementLabel(placement: number): string {
  return `${placement}${ordinalSuffix(placement)}`;
}
