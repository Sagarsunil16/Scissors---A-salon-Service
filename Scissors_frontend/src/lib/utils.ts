import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatMessageTime(date:string){
  return new Date(date).toLocaleDateString('en-US',{
    hour:'2-digit',
    minute:'2-digit',
    hour12:false
  })
}