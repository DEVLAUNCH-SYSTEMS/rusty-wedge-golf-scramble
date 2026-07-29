"use client";

type CopySource = {
  id: string;
  label: string;
};

export function CopySourceOptions({ copySources }: { copySources: CopySource[] }) {
  return copySources.map((source) => (
    <option key={source.id} value={source.id}>
      {source.label}
    </option>
  ));
}
