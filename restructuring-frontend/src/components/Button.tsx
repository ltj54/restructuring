import React from "react";
import { Link } from "react-router-dom";

type ButtonProps = {
  children: React.ReactNode;
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
};

export default function Button({
  children,
  to,
  onClick,
  disabled = false,
  className = "",
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl " +
    "border border-slate-300 bg-white text-slate-800 " +
    "px-4 py-2 text-sm " +
    "hover:bg-slate-50 transition " +
    "disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed";

  if (to) {
    return (
      <Link
        to={to}
        className={`${base} ${disabled ? "pointer-events-none opacity-50" : ""} ${className}`}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${className}`}
    >
      {children}
    </button>
  );
}
