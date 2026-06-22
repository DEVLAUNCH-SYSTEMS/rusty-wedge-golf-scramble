export function AdminForbidden() {
  return (
    <div className="flex min-h-full items-center justify-center bg-zinc-50 px-4">
      <div className="max-w-md rounded-lg border border-zinc-200 bg-white p-8 text-center">
        <h1 className="text-xl font-semibold text-zinc-900">Access denied</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Your account is signed in but is not on the organizer allowlist.
          Contact an existing organizer to request access.
        </p>
      </div>
    </div>
  );
}
