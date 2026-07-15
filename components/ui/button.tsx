import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-[12px] text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-primary-1/50 disabled:text-white",
          variant === "default" && "bg-primary-1 text-grey-5 hover:bg-primary-hover",
          variant === "outline" && "border border-primary-1 bg-primary-5 text-primary-1 hover:bg-primary-5",
          variant === "ghost" && "text-primary-1 hover:bg-primary-5",
          size === "default" && "h-11 px-6",
          size === "sm" && "h-9 rounded-[8px] px-3",
          size === "lg" && "h-12 px-6",
          size === "icon" && "h-11 w-11",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
