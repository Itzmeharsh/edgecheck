"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f7fcfe] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center justify-center">
        <div className="w-full">

          {/* Card */}
          <div className="rounded-3xl border border-[#dceff5] bg-white p-7 shadow-[0_20px_60px_rgba(34,135,166,0.10)] sm:p-9">
            <div className="mb-7 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center overflow-hidden rounded-[18px] bg-[#cdebf5]">
                <Image
                  src="/edgecheck-icon.png"
                  alt=""
                  width={56}
                  height={56}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-[#12313d]">
                Welcome back
              </h1>

              <p className="mt-2 text-sm text-[#6c8791]">
                Log in to continue to EdgeCheck.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-1.5 block text-sm font-medium text-[#294b57]"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-[#d7e9ee] bg-white px-4 py-3 text-sm text-[#173944] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#54b9d8] focus:ring-4 focus:ring-[#54b9d8]/10"
                />
              </div>

              {/* Password */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#294b57]"
                  >
                    Password
                  </label>

                  <button
                    type="button"
                    className="text-xs font-medium text-[#249bc2] hover:text-[#1685aa]"
                    onClick={() => {
                      setError("Password reset will be added next.");
                    }}
                  >
                    Forgot password?
                  </button>
                </div>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-[#d7e9ee] bg-white px-4 py-3 text-sm text-[#173944] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#54b9d8] focus:ring-4 focus:ring-[#54b9d8]/10"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#2da8cf] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2398be] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e5f0f3]" />
              <span className="text-xs text-[#9aafb6]">OR</span>
              <div className="h-px flex-1 bg-[#e5f0f3]" />
            </div>

            <p className="text-center text-sm text-[#718991]">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-semibold text-[#249bc2] hover:text-[#1685aa]"
              >
                Create one
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-[#8aa0a8]">
            AI-generated analysis is for informational purposes only and does
            not guarantee trading outcomes or investment returns.
          </p>
        </div>
      </div>
    </main>
  );
}