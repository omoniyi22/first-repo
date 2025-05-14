
import { useToast as useToastOriginal, toast as toastOriginal, type Toast, type ToastActionElement, type ToastProps } from "@/components/ui/use-toast";

// Re-export the toast hook and function
export const useToast = useToastOriginal;
export const toast = toastOriginal;

export type { Toast, ToastActionElement, ToastProps };
