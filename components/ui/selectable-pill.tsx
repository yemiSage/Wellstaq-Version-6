import * as React from "react"
import { cn } from "@/lib/utils"

interface SelectablePillProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  appearance?: "outlined" | "plain";
}

export const SelectablePill = React.forwardRef<HTMLButtonElement, SelectablePillProps>(
  ({ className, selected, appearance = "outlined", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={selected}
        className={cn(
          "inline-flex items-center justify-center rounded-[8px] border px-2 py-1 text-xs font-normal leading-5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-1 [&_svg]:h-3.5 [&_svg]:w-3.5",
          selected
            ? "border-transparent bg-[#E6E6E6] font-medium text-[#333333]"
            : appearance === "plain"
              ? "border-transparent bg-transparent text-[#667085] hover:bg-grey-5 hover:text-grey-2"
              : "border-grey-4 bg-white text-[#667085] hover:bg-grey-5 hover:text-grey-2",
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
