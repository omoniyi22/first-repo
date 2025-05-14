
import { useToast as useToastOriginal, toast as toastOriginal } from "@/components/ui/toast";

// Re-export the toast hook and function
export const useToast = useToastOriginal;
export const toast = toastOriginal;

export type { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
