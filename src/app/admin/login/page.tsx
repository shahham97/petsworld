"use client";

import React, { useActionState, useState } from "react";
import { loginAdminAction, LoginActionState } from "@/actions/auth-actions";
import { PetsWorldLogo } from "@/components/brand/PetsWorldLogo";
import { InlineAlert } from "@/components/ui/InlineAlert";
import { FieldError } from "@/components/ui/FieldError";
import { Lock, Mail, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";

const initialState: LoginActionState = {
  success: false,
};

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAdminAction, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <PetsWorldLogo className="justify-center mb-6" asLink={false} />
        <h2 className="text-2xl font-black text-[#2B2622] tracking-tight">
          Admin Portal Sign In
        </h2>
        <p className="mt-1 text-sm text-[#6B6560]">
          Manage products, orders, categories, and store settings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-[#E8D9CD] shadow-sm">
          {state?.error && (
            <div className="mb-6">
              <InlineAlert type="error" title="Sign In Failed">
                {state.error}
              </InlineAlert>
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold uppercase tracking-wider text-[#2B2622] mb-1.5"
              >
                Admin Email
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6560]">
                  <Mail className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue="admin@petsworld.pk"
                  placeholder="admin@petsworld.pk"
                  className="block w-full pl-10 pr-3.5 py-3 text-sm rounded-2xl border border-[#E8D9CD] bg-[#FFF8F0]/30 text-[#2B2622] placeholder:text-[#6B6560]/60 focus:outline-none focus:ring-2 focus:ring-[#1F4D3A] focus:border-transparent transition-all"
                  aria-describedby="email-error"
                />
              </div>
              <FieldError id="email-error" error={state?.fieldErrors?.email} />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-bold uppercase tracking-wider text-[#2B2622] mb-1.5"
              >
                Password
              </label>
              <div className="relative rounded-2xl">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6B6560]">
                  <Lock className="h-4 w-4" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-3 text-sm rounded-2xl border border-[#E8D9CD] bg-[#FFF8F0]/30 text-[#2B2622] placeholder:text-[#6B6560]/60 focus:outline-none focus:ring-2 focus:ring-[#1F4D3A] focus:border-transparent transition-all"
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#6B6560] hover:text-[#2B2622] focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </div>
              <FieldError id="password-error" error={state?.fieldErrors?.password} />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#1F4D3A] text-white text-sm font-bold hover:bg-[#163B2C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1F4D3A] shadow-md shadow-[#1F4D3A]/20 disabled:opacity-60 transition-all cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    <span>Sign In to Dashboard</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-[#E8D9CD] text-center">
            <p className="text-xs text-[#6B6560]">
              Authorized personnel only. All access attempts are monitored and recorded.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
