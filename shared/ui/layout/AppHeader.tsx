"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b px-4 py-3">
      <Link href="/" className="font-semibold tracking-tight">
        Huddle
      </Link>

      <div className="flex items-center gap-3">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="rounded-md border px-3 py-2 text-sm">Sign in</button>
          </SignInButton>

          <SignUpButton mode="modal">
            <button className="rounded-md bg-black px-3 py-2 text-sm text-white">Sign up</button>
          </SignUpButton>
        </Show>

        <Show when="signed-in">
          <Link href="/dashboard" className="text-sm underline underline-offset-4">
            Dashboard
          </Link>
          <UserButton />
        </Show>
      </div>
    </header>
  );
}