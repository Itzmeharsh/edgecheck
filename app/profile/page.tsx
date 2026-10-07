import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfilePage from "@/components/profile-page";

export default async function ProfileRoute() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email =
    user.email ?? "EdgeCheck user";

  const name =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : email.split("@")[0];

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, plan")
    .eq("id", user.id)
    .single();

  const plan =
    profile?.plan === "premium"
      ? "premium"
      : "free";

  return (
    <main className="min-h-screen bg-[#f7fcfe]">
      {/* Navbar */}
      <header className="border-b border-[#dceff5] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">

          <Link
            href="/dashboard"
            className="block overflow-hidden rounded-[18px]"
          >
            <Image
              src="/edgecheck-logo.png"
              alt="EdgeCheck"
              width={170}
              height={45}
              unoptimized
              className="block h-auto w-[150px] sm:w-[170px]"
            />
          </Link>

          <Link
            href="/dashboard"
            className="rounded-xl border border-[#dceff5] bg-white px-4 py-2 text-sm font-semibold text-[#48636c] transition hover:bg-[#f1f8fa] hover:text-[#173944]"
          >
            ← Dashboard
          </Link>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="mb-8">
          <p className="text-sm font-medium text-[#2da8cf]">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold tracking-tight text-[#12313d]">
            Your Profile
          </h1>

          <p className="mt-2 text-sm text-[#6c8791]">
            View your account details and manage your plan.
          </p>
        </div>

        <ProfilePage
          name={name}
          email={email}
          plan={plan}
        />
      </section>
    </main>
  );
}