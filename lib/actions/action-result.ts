export type ActionResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export function actionSuccess(message: string): ActionResult {
  return { ok: true, message };
}

export function actionFailure(message: string): ActionResult {
  return { ok: false, message };
}
