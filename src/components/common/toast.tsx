import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "error" | "success";
  duration?: number;
  onHide: () => void;
}

export default function Toast({ message, type, duration = 3000, onHide }: ToastProps) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);

    const timer = setTimeout(() => {
      setShow(false);
    }, duration);

    const hideTimer = setTimeout(() => {
      onHide();
    }, duration + 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [duration, onHide]);

  return (
    <div
      className={`fixed bottom-4 right-4 flex items-center justify-center z-50 p-4 text-white rounded-md transition-all duration-500 ease-in-out transform ${
        type === "error" ? "bg-red-500" : "bg-green-500"
      } ${show ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
    >
      {message}
      <button className="ml-4 text-white cursor-pointer" onClick={onHide}>
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
