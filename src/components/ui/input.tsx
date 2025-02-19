import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-md border border-[#1F1F1F] bg-dark_grey px-3 py-1 text-sm shadow-sm",
          "text-white placeholder:text-light_grey",
          "transition-all duration-200",
          "focus:outline-none focus:ring-1 focus:ring-[#1F1F1F]",
          "focus:bg-dark_grey focus:text-white",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "[&:not(:focus)]:bg-dark_grey [&:not(:focus)]:text-white",
          "[-webkit-appearance:none]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
