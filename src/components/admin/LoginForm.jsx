"use client";

import { useActionState } from "react";
import { login } from "@/app/admin/actions";
import { buttonClass, inputClass, labelClass } from "./ui";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="mt-5 space-y-4">
      <div>
        <label htmlFor="username" className={labelClass}>
          İstifadəçi adı
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          required
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          Şifrə
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputClass}
        />
      </div>

      {state?.error && (
        <p role="alert" className="text-sm font-semibold text-[#9b2f22]">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className={`${buttonClass.primary} w-full justify-center`}>
        {pending ? "Yoxlanılır…" : "Daxil ol"}
      </button>
    </form>
  );
}
