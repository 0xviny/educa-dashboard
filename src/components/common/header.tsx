"use client";
/* eslint-disable */

import { useEffect, useRef, useState } from "react";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Bell, EllipsisVertical, LogOut } from "lucide-react";
import useLocalStorage from "@/hooks/useLocalStorage";

export default function Header() {
  const [isLogged, setIsLogged] = useState(false);
  const [userName, setUserName] = useState("Professor(a)");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { notifications, addNotification, removeNotification } = useNotifications();

  const [authToken] = useLocalStorage<string>("authToken", "");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }

    if (authToken) {
      setIsLogged(true);
    } else {
      setIsLogged(false);
    }
  }, [authToken]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCopy = (message: string) => {
    navigator.clipboard.writeText(message).then(() => {
      addNotification("Notificação copiada!", "success");
    });
  };

  const NotificationItem = ({ notif }: { notif: Notification }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div className="flex items-center justify-between border-b border-gray-200 py-1">
        <span className="text-sm">{notif.message}</span>
        <div className="relative">
          <button
            onClick={() => setShowActions((prev) => !prev)}
            className="text-gray-500 hover:text-gray-700"
          >
            <EllipsisVertical className="w-4 h-4 inline-block" />
          </button>
          {showActions && (
            <div className="absolute right-0 mt-1 w-32 bg-white text-black rounded shadow p-2 z-10">
              <button
                onClick={() => {
                  handleCopy(notif.message);
                  setShowActions(false);
                }}
                className="block w-full text-left text-sm hover:bg-gray-100 px-2 py-1"
              >
                Copiar
              </button>
              <button
                onClick={() => {
                  removeNotification(notif.id);
                  setShowActions(false);
                }}
                className="block w-full text-left text-sm hover:bg-gray-100 px-2 py-1"
              >
                Deletar
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-black/50 border-b border-zinc-900 relative">
      <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
        EDUCA DASHBOARD
      </h1>
      <div className={`${isLogged ? "flex" : "hidden"} items-center space-x-4`}>
        <p className="hidden sm:block text-sm text-gray-200">Olá, {userName}!</p>
        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
          <span className="text-white font-bold">{userName.charAt(0)}</span>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            window.location.reload();
          }}
          className="cursor-pointer"
        >
          <LogOut className="text-red-500 inline-block" /> Sair
        </button>

        {/* <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="text-gray-200 relative cursor-pointer"
          >
            <Bell className="w-6 h-6 inline-block" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full px-1">
                {notifications.length}
              </span>
            )}
          </button>
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-zinc-950 rounded-lg shadow-lg z-50">
              <div className="p-4">
                <h3 className="font-semibold">Notificações</h3>
                {notifications.length === 0 ? (
                  <p className="text-white/75 text-sm">Sem notificações.</p>
                ) : (
                  <div className="text-white mt-2 max-h-60 overflow-y-auto">
                    {notifications.map((notif) => (
                      <NotificationItem key={notif.id} notif={notif} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div> */}
      </div>
    </header>
  );
}
