
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Custom shadow utility for glass effect
export const shadowGlass = "0 8px 32px 0 rgba(31, 38, 135, 0.07)"
