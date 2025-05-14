
import { useToast as useToastImpl } from "@/components/ui/use-toast";
import { toast as toastImpl } from "@/components/ui/use-toast";

// Re-export the toast hook and function to maintain compatibility
export const useToast = useToastImpl;
export const toast = toastImpl;

export type { Toast, ToastActionElement, ToastProps } from "@/components/ui/toast";
