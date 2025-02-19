import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface GradientButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  size?: 'default' | 'sm' | 'lg'
}

const GradientButton = React.forwardRef<HTMLButtonElement, GradientButtonProps>(
  ({ className, size = 'default', asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const sizeClasses = {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-10 rounded-md px-8",
    }

    return (
      <div className="relative w-full">
        <Comp
          className={cn(
            "relative z-10 inline-flex w-full items-center justify-center rounded-md text-sm font-medium",
            "bg-gradient-to-r from-[#0051ff] to-[#7100fc] text-white",
            "transition-all duration-300",
            "group",
            "hover:bg-white hover:bg-none",
            sizeClasses[size],
            className
          )}
          ref={ref}
          {...props}
        >
          <span className="transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-[#0051ff] group-hover:to-[#7100fc] group-hover:bg-clip-text group-hover:text-transparent">
            {children}
          </span>
        </Comp>
      </div>
    )
  }
)
GradientButton.displayName = "GradientButton"

export { GradientButton }
