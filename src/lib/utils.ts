import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) { // created by default, when we initiate the shadcn
  return twMerge(clsx(inputs))                // npx shadcn-ui@latest init
}
