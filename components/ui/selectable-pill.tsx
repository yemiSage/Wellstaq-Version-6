import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectablePillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const SelectablePill = React.forwardRef<HTMLButtonElement, SelectablePillProps>(
  ({ className, selected, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "inline-flex items-center justify-center rounded-[12px] border px-6 py-2.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1",
          selected 
            ? "border-primary-1 bg-primary-5 text-primary-1" 
            : "border-grey-4 bg-white text-grey-2 hover:bg-grey-5",
          className
        )}
        {...props}
      >
        {children}
      </button>
    )
  }
)
SelectablePill.displayName = "SelectablePill"
