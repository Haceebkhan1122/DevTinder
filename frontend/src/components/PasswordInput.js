"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "@/components/Icons";
import { PASSWORD_RULES } from "@/lib/password";
import { cn } from "@/lib/utils";

export function PasswordInput({ id, label, value, onChange, autoComplete = "current-password", placeholder = "••••••••" }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          className="input pr-11"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3.5 text-subtle hover:text-ink"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
    </div>
  );
}

// Live checklist of the backend's strong-password rules
export function PasswordChecklist({ password }) {
  return (
    <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
      {PASSWORD_RULES.map((rule) => {
        const ok = rule.test(password);
        return (
          <li key={rule.label} className={cn("flex items-center gap-1.5 transition", ok ? "text-success" : "text-subtle")}>
            <span className={cn("size-1.5 rounded-full", ok ? "bg-success" : "bg-navy-600")} />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
