import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;

type TooltipRootProps = React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>;

type TooltipInternalContextValue = {
  closeAndSuppress: () => void;
  clearSuppress: () => void;
  isSuppressed: () => boolean;
};

const TooltipInternalContext = React.createContext<TooltipInternalContextValue | null>(null);

function useTooltipInternalContext(): TooltipInternalContextValue | null {
  return React.useContext(TooltipInternalContext);
}

/**
 * Tooltip
 * - Renders in a Portal (see TooltipContent) with a very high z-index
 * - Shows on hover only
 * - On click/pointer down: hides immediately, then suppresses re-open until pointer leaves
 */
const Tooltip = ({ open: openProp, onOpenChange: onOpenChangeProp, ...props }: TooltipRootProps) => {
  const [open, setOpen] = React.useState(false);
  const suppressedRef = React.useRef(false);

  const closeAndSuppress = React.useCallback(() => {
    suppressedRef.current = true;
    setOpen(false);
    onOpenChangeProp?.(false);
  }, [onOpenChangeProp]);

  const clearSuppress = React.useCallback(() => {
    suppressedRef.current = false;
  }, []);

  const isSuppressed = React.useCallback(() => suppressedRef.current, []);

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      // If we're suppressed (e.g. user clicked while hovered), ignore open attempts
      // until pointer leaves and re-enters.
      if (next && suppressedRef.current) return;
      setOpen(next);
      onOpenChangeProp?.(next);
    },
    [onOpenChangeProp]
  );

  // If user controls `open`, respect it but still provide suppression helpers for click behavior.
  const resolvedOpen = openProp ?? open;

  return (
    <TooltipInternalContext.Provider value={{ closeAndSuppress, clearSuppress, isSuppressed }}>
      <TooltipPrimitive.Root open={resolvedOpen} onOpenChange={handleOpenChange} {...props} />
    </TooltipInternalContext.Provider>
  );
};

const TooltipTrigger = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>
>(({ onPointerDown, onPointerLeave, ...props }, ref) => {
  const ctx = useTooltipInternalContext();

  return (
    <TooltipPrimitive.Trigger
      ref={ref}
      {...props}
      onPointerDown={(e) => {
        // Prevent focus-triggered tooltip on click and hide immediately.
        // Keep the click behavior intact.
        e.preventDefault();
        ctx?.closeAndSuppress();
        onPointerDown?.(e);
      }}
      onPointerLeave={(e) => {
        // Next hover can show again.
        ctx?.clearSuppress();
        onPointerLeave?.(e);
      }}
    />
  );
});
TooltipTrigger.displayName = TooltipPrimitive.Trigger.displayName;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Portal + maximal z-index to avoid any clipping/covering.
        "z-[2147483647] overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
