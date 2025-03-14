import { useState, useEffect } from "react";

export interface Notification {
  id: number;
  message: string;
  type: "error" | "success";
  visible: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("notifications");
    if (stored) {
      setNotifications(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("notifications", JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (message: string, type: "error" | "success") => {
    const newNotif: Notification = {
      id: Date.now(),
      message,
      type,
      visible: true,
    };
    setNotifications((prev) => [...prev, newNotif]);
  };

  const hideNotification = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, visible: false } : n)));
  };

  const removeNotification = (id: number) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { notifications, addNotification, hideNotification, removeNotification, setNotifications };
}
