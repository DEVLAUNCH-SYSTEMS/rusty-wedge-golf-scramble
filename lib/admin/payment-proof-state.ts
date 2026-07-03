export type ProofLoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; objectUrl: string };
