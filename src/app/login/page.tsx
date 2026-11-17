"use client";

import { useActionState } from "react";
import { requestLogin, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(requestLogin, initialState);

  return (
    <main className="flex flex-1 items-center justify-center p-8">
      <form action={action} className="flex w-full max-w-sm flex-col gap-4">
        <h1 className="text-xl font-semibold">Owner sign-in</h1>
        {state.sent ? (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Check your inbox for a sign-in link.
          </p>
        ) : (
          <>
            <input
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
            {state.error && (
              <p className="text-sm text-red-600">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50"
            >
              {pending ? "Sending…" : "Send sign-in link"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
