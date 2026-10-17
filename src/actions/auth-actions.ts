"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { setAdminSessionCookie, clearAdminSessionCookie, checkRateLimit } from "@/lib/auth";
import { redirect } from "next/navigation";
import { MESSAGES } from "@/lib/messages";

const LoginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export type LoginActionState = {
  success: boolean;
  error?: string;
  fieldErrors?: {
    email?: string[];
    password?: string[];
  };
};

export async function loginAdminAction(
  prevState: LoginActionState | null,
  formData: FormData
): Promise<LoginActionState> {
  const rawEmail = formData.get("email");
  const rawPassword = formData.get("password");

  const validated = LoginSchema.safeParse({
    email: rawEmail,
    password: rawPassword,
  });

  if (!validated.success) {
    return {
      success: false,
      fieldErrors: validated.error.flatten().fieldErrors,
      error: "Please check your entered credentials.",
    };
  }

  const { email, password } = validated.data;

  // Rate limit login attempts: 5 attempts per 10 minutes per email
  const isAllowed = checkRateLimit(`login_${email.toLowerCase()}`, 5, 10 * 60 * 1000);
  if (!isAllowed) {
    return {
      success: false,
      error: MESSAGES.AUTH_RATE_LIMITED,
    };
  }

  try {
    const adminUser = await db.adminUser.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!adminUser) {
      // Intentionally uniform error message to prevent account enumeration
      return {
        success: false,
        error: MESSAGES.AUTH_INVALID_CREDENTIALS,
      };
    }

    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isMatch) {
      return {
        success: false,
        error: MESSAGES.AUTH_INVALID_CREDENTIALS,
      };
    }

    // Set signed httpOnly session cookie
    await setAdminSessionCookie({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
    });
  } catch (error: any) {
    if (error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    console.error("[LOGIN_ACTION_ERROR]:", error);
    return {
      success: false,
      error: error?.message?.includes("insecure transport")
        ? "Database connection requires SSL. Please wait a moment while connection resets."
        : error?.message || "Unable to sign in. Please try again shortly.",
    };
  }

  redirect("/admin");
}

export async function logoutAdminAction(): Promise<void> {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
