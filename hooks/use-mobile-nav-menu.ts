"use client";

import { useCallback, useRef, useState } from "react";

import {
  useCloseOnEscape,
  useCloseOnOutsideClick,
} from "@/hooks/use-close-on-outside-interaction";

export function useMobileNavMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeMenu = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const toggleMenu = useCallback(() => {
    setOpen((current) => !current);
  }, []);

  useCloseOnEscape(open, closeMenu);
  useCloseOnOutsideClick(open, containerRef, closeMenu);

  return { open, containerRef, triggerRef, closeMenu, toggleMenu };
}
