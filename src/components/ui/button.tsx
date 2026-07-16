import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-xs font-semibold uppercase tracking-[0.08em] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-[var(--ink,#0F0F0F)] text-white hover:bg-[var(--signal,#D71E33)]",
        destructive: "bg-[var(--signal,#D71E33)] text-white hover:bg-[color-mix(in_oklab,var(--signal,#D71E33)_80%,black)]",
        outline:
          "border border-[var(--ink,#0F0F0F)] bg-transparent text-foreground hover:bg-[var(--ink,#0F0F0F)] hover:text-white",
        secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-muted",
        ghost: "text-foreground hover:underline underline-offset-4 decoration-2 decoration-[var(--signal,#D71E33)]",
        link: "text-[var(--signal,#D71E33)] underline underline-offset-4 decoration-2",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 px-3 text-[10px]",
        lg: "h-12 px-8 text-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
