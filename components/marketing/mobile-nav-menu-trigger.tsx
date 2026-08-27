function MenuIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 6l12 12M18 6L6 18" />
      </svg>
    );
  }

  return (
    <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function MobileNavMenuTrigger({
  open,
  panelId,
  triggerRef,
  onToggle,
}: {
  open: boolean;
  panelId: string;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onToggle: () => void;
}) {
  return (
    <button
      ref={triggerRef}
      type="button"
      aria-expanded={open}
      aria-controls={panelId}
      aria-label={open ? "Close navigation" : "Open navigation"}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-rw-gold hover:text-rw-gold"
      onClick={onToggle}
    >
      <MenuIcon open={open} />
    </button>
  );
}
