import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { NotificationProps, NotificationType } from "@/types/notification";

const palette: Record<NotificationType, { light: string; dark: string; text: string }> = {
  success: { light: "#e8f2df", dark: "#4f6d2f", text: "#4f6d2f" },
  reminder: { light: "#fff2d8", dark: "#8a5d09", text: "#8a5d09" },
  warning: { light: "#f5dfd8", dark: "#8a2e16", text: "#8a2e16" },
  info: { light: "#f6e2d3", dark: "#6f2a0b", text: "#6f2a0b" },
};

export function Notification({ message, type = "info", visible, duration = 2500, onClose }: NotificationProps) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [visible, duration, onClose]);

  const p = (palette as any)[type] ?? palette.info;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25 }}
          className="fixed left-1/2 top-6 z-50 -translate-x-1/2 max-w-xl w-[min(90%,600px)] rounded-lg shadow-lg"
          style={{ backgroundColor: p.light, borderTop: `4px solid ${p.dark}` }}
        >
          <div className="px-4 py-3 text-center">
            <p className="m-0 text-sm font-semibold" style={{ color: p.text }}>{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Notification;
