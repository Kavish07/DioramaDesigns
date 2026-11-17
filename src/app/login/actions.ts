"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

export type LoginState = { error?: string; sent?: boolean };

export async function requestLogin(
  _state: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  // Check before ever touching Supabase: the owner's email never reaches
  // the browser, and no one else can trigger a magic-link send.
  if (!email || email !== process.env.OWNER_EMAIL?.toLowerCase()) {
    return { error: "This gallery has a single owner account." };
  }

  const host = (await headers()).get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") || host.startsWith("127.0.0.1")
    ? "http"
    : "https";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${protocol}://${host}/auth/callback` },
  });

  if (error) {
    return { error: "Could not send the sign-in link. Try again." };
  }

  return { sent: true };
}
