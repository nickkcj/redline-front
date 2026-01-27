"use client"

import { Icon, IconProps } from "@phosphor-icons/react"
import { forwardRef, useState } from "react"
import { cn } from "@/lib/utils"

export interface PhosphorIconProps extends Omit<IconProps, "weight"> {
  /**
   * The Phosphor icon component to render
   */
  icon: Icon
  /**
   * Optional className for additional styling
   */
  className?: string
  /**
   * Weight for normal state (default: "regular")
   */
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"
  /**
   * Weight for hover state (default: "fill")
   */
  hoverWeight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone"
  /**
   * Disable hover effect
   */
  disableHover?: boolean
}

/**
 * Phosphor Icon wrapper with automatic hover effect
 * Normal state: regular weight
 * Hover state: fill weight
 */
export const PhosphorIcon = forwardRef<SVGSVGElement, PhosphorIconProps>(
  ({ 
    icon: IconComponent, 
    className,
    weight = "regular",
    hoverWeight = "fill",
    disableHover = false,
    size = 24,
    ...props 
  }, ref) => {
    const [isHovered, setIsHovered] = useState(false)

    const currentWeight = !disableHover && isHovered ? hoverWeight : weight

    return (
      <IconComponent
        ref={ref}
        weight={currentWeight}
        size={size}
        className={cn("transition-all duration-150", className)}
        onMouseEnter={() => !disableHover && setIsHovered(true)}
        onMouseLeave={() => !disableHover && setIsHovered(false)}
        {...props}
      />
    )
  }
)

PhosphorIcon.displayName = "PhosphorIcon"
