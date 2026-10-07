"use client";

import { FormEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          name: name.trim(),
        },
      },
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    if (data.session) {
      router.push("/dashboard");
      router.refresh();
      return;
    }

    setSuccess(
      "Account created successfully. Please check your email to confirm your account."
    );
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
                Create your account
              </h1>

              <p className="mt-2 text-sm text-[#6c8791]">
                Start building and checking your trading strategies.
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-4">
              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-[#294b57]"
                >
                  Full name
                </label>

                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoComplete="name"
                  required
                  className="w-full rounded-xl border border-[#d7e9ee] bg-white px-4 py-3 text-sm text-[#173944] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#54b9d8] focus:ring-4 focus:ring-[#54b9d8]/10"
                />
              </div>

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
                <label
                  htmlFor="password"
                  className="mb-1.5 block text-sm font-medium text-[#294b57]"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  className="w-full rounded-xl border border-[#d7e9ee] bg-white px-4 py-3 text-sm text-[#173944] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#54b9d8] focus:ring-4 focus:ring-[#54b9d8]/10"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#2da8cf] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2398be] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#e5f0f3]" />
              <span className="text-xs text-[#9aafb6]">OR</span>
              <div className="h-px flex-1 bg-[#e5f0f3]" />
            </div>

            <p className="text-center text-sm text-[#718991]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-[#249bc2] hover:text-[#1685aa]"
              >
                Log in
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