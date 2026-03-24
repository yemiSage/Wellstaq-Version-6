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
          "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:bg-primary-4 disabled:text-white",
          variant === "default" && "bg-primary-1 text-white hover:bg-primary-1/90",
          variant === "outline" && "border border-grey-4 bg-white hover:bg-grey-5 text-grey-1",
          variant === "ghost" && "hover:bg-grey-5 text-grey-1",
          size === "default" && "h-[44px] px-4 py-2 rounded-[12px]",
          size === "sm" && "h-9 rounded-lg px-3",
          size === "lg" && "h-14 rounded-2xl px-8",
          size === "icon" && "h-10 w-10",
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"
export { Button }
