import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AddStrategy from "./add-strategy";
import DashboardMarket from "@/components/dashboard-market";
import PremiumButton from "@/components/premium-button";
import ProfileDropdown from "@/components/profile-dropdown";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const email = user.email ?? "EdgeCheck user";

  const name =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : email.split("@")[0];

  // -----------------------------------------------------
  // Profile
  // -----------------------------------------------------

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, plan")
    .eq("id", user.id)
    .single();

  const plan =
    profile?.plan === "premium"
      ? "premium"
      : "free";

  const strategyLimit =
    plan === "premium" ? 25 : 3;

  // -----------------------------------------------------
  // Strategies
  // -----------------------------------------------------

  const { data: strategies } = await supabase
    .from("strategies")
    .select(
      "id, name, description, rules, created_at"
    )
    .eq("user_id", user.id)
    .order("created_at", {
      ascending: false,
    });

  const strategyCount =
    strategies?.length ?? 0;

  // -----------------------------------------------------
  // Daily usage
  // -----------------------------------------------------

  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  const { data: usage } = await supabase
    .from("daily_usage")
    .select("analysis_count")
    .eq("user_id", user.id)
    .eq("usage_date", today)
    .maybeSingle();

  const analysisCount =
    usage?.analysis_count ?? 0;

  return (
    <main className="min-h-screen bg-[#f7fcfe]">
      {/* Navbar */}
      <header className="border-b border-[#dceff5] bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
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

          <div className="flex items-center gap-3">
            {/* Premium */}
            <PremiumButton plan={plan} />

            {/* User */}
           <div className="hidden text-right sm:block">
  <p className="text-sm font-semibold text-[#173944]">
    {name}
  </p>

  <p className="text-xs text-[#8aa0a8]">
    {email}
  </p>
</div>

<ProfileDropdown
  name={name}
  email={email}
/>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Heading */}
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-[#2da8cf]">
              Dashboard
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-[#12313d] sm:text-4xl">
              Welcome, {name}.
            </h1>

            <p className="mt-2 max-w-2xl text-[#6c8791]">
              Build your trading strategies and check them
              against current market setups.
            </p>
          </div>

          <AddStrategy />
        </div>

        {/* Market Chart */}
        <DashboardMarket
  strategies={(strategies ?? []).map((strategy) => ({
    id: strategy.id,
    name: strategy.name,
    rules:
      strategy.rules &&
      typeof strategy.rules === "object" &&
      !Array.isArray(strategy.rules)
        ? (strategy.rules as Record<string, unknown>)
        : {},
  }))}
/>

        {/* -------------------------------------------------
            Stats
        -------------------------------------------------- */}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#dceff5] bg-white p-5">
            <p className="text-sm text-[#78919a]">
              Active strategies
            </p>

            <p className="mt-2 text-3xl font-bold text-[#173944]">
              {strategyCount}
            </p>

            <p className="mt-1 text-xs text-[#9aafb6]">
              {plan === "free"
                ? `Free limit: ${strategyLimit}`
                : `Premium limit: ${strategyLimit}`}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dceff5] bg-white p-5">
            <p className="text-sm text-[#78919a]">
              Analyses today
            </p>

            <p className="mt-2 text-3xl font-bold text-[#173944]">
              {analysisCount}
            </p>

            <p className="mt-1 text-xs text-[#9aafb6]">
              {plan === "free"
                ? "Free limit: 5/day"
                : "Premium limit: 50/day"}
            </p>
          </div>

          <div className="rounded-2xl border border-[#dceff5] bg-white p-5">
            <p className="text-sm text-[#78919a]">
              Current plan
            </p>

            <p className="mt-2 text-3xl font-bold capitalize text-[#173944]">
              {plan}
            </p>

            <p className="mt-1 text-xs text-[#9aafb6]">
              {plan === "free"
                ? "Upgrade for deeper analysis"
                : "Advanced EdgeCheck analysis"}
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-10 text-center text-xs leading-5 text-[#8aa0a8]">
          AI-generated analysis is for informational purposes
          only and does not guarantee trading outcomes or
          investment returns.
        </p>
      </section>
    </main>
  );
}