import * as React from "react"
import { cn } from "@/lib/utils"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-[8px] border border-grey-4 bg-white px-4 py-3 text-sm text-grey-2 ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-grey-3 focus-visible:border-primary-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-1/20 disabled:cursor-not-allowed disabled:text-grey-2",
          className
        )}
        ref={ref}
        {...props}
        name={props.name ?? props.id}
      />
    )
  }
)
Input.displayName = "Input"
export { Input }
