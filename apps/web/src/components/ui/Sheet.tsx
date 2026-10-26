"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  /** "bottom" is the mobile bottom sheet; "right" is the 640px desktop drawer. */
  side?: "bottom" | "right";
  children: React.ReactNode;
};

export function Sheet({ open, onOpenChange, title, description, side = "bottom", children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[1000] animate-fade-in bg-[var(--backdrop)]" />
        <Dialog.Content
          className={cn(
            "fixed z-[1001] bg-white shadow-xl focus:outline-none",
            side === "bottom"
              ? "inset-x-0 bottom-0 mx-auto max-h-[90vh] w-full max-w-[520px] animate-sheet-in overflow-y-auto rounded-t-[var(--radius-sheet)] px-5 pb-8 pt-3"
              : "inset-y-0 right-0 w-full max-w-[640px] animate-drawer-in overflow-y-auto",
          )}
        >
          {side === "bottom" && <div aria-hidden className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-200" />}
          <Dialog.Title className={side === "bottom" ? "text-[22px] font-bold text-cobalt-900" : "sr-only"}>{title}</Dialog.Title>
          {description ? (
            <Dialog.Description className="mt-1 text-[15px] text-ink-500">{description}</Dialog.Description>
          ) : (
            <Dialog.Description className="sr-only">{title}</Dialog.Description>
          )}
          {children}
          {side === "right" && (
            <Dialog.Close
              aria-label="Close"
              className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/90 text-ink-800 shadow-sm"
            >
              <X size={20} strokeWidth={2} />
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
