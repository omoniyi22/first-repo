
import { toast as sonnerToast, ToastOptions as SonnerToastOptions } from "@/components/ui/use-toast";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
  action?: React.ReactNode;
  duration?: number;
}

export function toast(options: ToastOptions) {
  return sonnerToast({
    title: options.title,
    description: options.description,
    variant: options.variant as SonnerToastOptions["variant"],
    action: options.action,
    duration: options.duration,
  });
}

export { useToast } from "@/components/ui/use-toast";
