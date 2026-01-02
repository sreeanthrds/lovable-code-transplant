
import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border border-white/20 bg-white/[0.01] backdrop-blur-[4px] p-4 text-popover-foreground shadow-[0_8px_32px_rgba(0,0,0,0.8),0_0_0_1px_rgba(72,187,178,0.2)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      onOpenAutoFocus={(e) => {
        // Prevent autofocus which can cause mobile issues
        e.preventDefault();
      }}
      onCloseAutoFocus={(e) => {
        // Prevent autofocus which can cause mobile issues
        e.preventDefault();
      }}
      // Ensure clicks inside the popover don't propagate to elements behind it
      onPointerDownOutside={(e) => {
        const target = e.target as HTMLElement;
        // If we're clicking on a command item, don't close
        if (target.hasAttribute('cmdk-item')) {
          e.preventDefault();
        }
      }}
      // Higher z-index to make sure it appears above other elements
      style={{ 
        zIndex: 9999,
        background: 'rgba(255, 255, 255, 0.01)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)'
      }}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
