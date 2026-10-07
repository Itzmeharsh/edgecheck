import Image from "next/image";
import Link from "next/link";
import PremiumButton from "@/components/premium-button";

const strategies = [
  {
    name: "Breakout Retest",
    description:
      "Identifies breakout structures followed by a retest of the key level.",
  },
  {
    name: "Trendline Bounce",
    description:
      "Analyzes price reactions around a defined trendline and its surrounding structure.",
  },
  {
    name: "Support Reversal",
    description:
      "Looks for potential reversal structures around significant support levels.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7FBFD] text-[#102A43]">
      {/* Background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-[#1597D4]/[0.08] blur-3xl" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1597D408_1px,transparent_1px),linear-gradient(to_bottom,#1597D408_1px,transparent_1px)] bg-[size:70px_70px]" />
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <nav className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Full Logo */}
        <Link
  href="/"
  className="relative block h-10 w-[145px] shrink-0 overflow-hidden rounded-[12px] bg-[#CDEBF5] sm:h-11 sm:w-[175px] md:h-12 md:w-[200px] lg:w-[220px]"
>
  <Image
    src="/edgecheck-logo.png"
    alt="EdgeCheck"
    fill
    priority
    unoptimized
    sizes="(max-width: 640px) 145px, (max-width: 768px) 175px, (max-width: 1024px) 200px, 220px"
    className="object-contain"
  />
</Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/login"
            className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#627D98] transition hover:text-[#102A43] sm:px-4 sm:text-sm"
          >
            Log in
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-[#1597D4] px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-[#1597D4]/20 transition hover:bg-[#1086BE] sm:px-4 sm:text-sm"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-20 pt-14 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        {/* Robot Logo */}
        <div className="relative mb-7 h-[82px] w-[82px] overflow-hidden rounded-[22px] bg-[#CDEBF5] shadow-sm sm:h-[96px] sm:w-[96px] md:h-[108px] md:w-[108px]">
  <Image
    src="/edgecheck-icon.png"
    alt="EdgeCheck AI"
    fill
    priority
    unoptimized
    sizes="(max-width: 640px) 82px, (max-width: 768px) 96px, 108px"
    className="object-contain"
  />
</div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-[#D9EAF2] bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#627D98] shadow-sm sm:px-4 sm:text-xs sm:tracking-[0.16em]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#1597D4]" />
          AI-powered strategy analysis
        </div>

        {/* Heading */}
        <h1 className="mt-8 max-w-5xl px-2 text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-[#102A43] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[82px]">
          Think you&apos;re on the
          <br />
          <span className="text-[#1597D4]">edge of trading?</span>
        </h1>

        {/* Tagline */}
        <p className="mt-6 text-xl font-semibold tracking-tight text-[#102A43] sm:text-2xl md:text-3xl">
          EdgeCheck yourself.
        </p>

        {/* Description */}
        <p className="mt-5 max-w-2xl text-sm leading-6 text-[#627D98] sm:text-base sm:leading-7 md:text-lg">
          Turn your trading ideas into structured strategies and evaluate them
          against real market conditions with AI-powered analysis.
        </p>

        {/* CTA */}
        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
          <Link
            href="/signup"
            className="rounded-xl bg-[#1597D4] px-6 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-[#1597D4]/20 transition hover:bg-[#1086BE] sm:px-7"
          >
            Start Building Your Edge
          </Link>

          <Link
            href="#how-it-works"
            className="rounded-xl border border-[#D9EAF2] bg-white px-6 py-3.5 text-center text-sm font-semibold text-[#486581] shadow-sm transition hover:border-[#B9D8E7] hover:text-[#102A43] sm:px-7"
          >
            See How It Works
          </Link>
        </div>

        {/* =====================================================
            PRODUCT PREVIEW
        ===================================================== */}
        <div className="mt-16 w-full max-w-6xl sm:mt-20 lg:mt-24">
          <div className="rounded-2xl border border-[#D9EAF2] bg-white p-1.5 shadow-[0_30px_80px_rgba(16,42,67,0.10)] sm:p-2">
            <div className="overflow-hidden rounded-xl border border-[#E5F0F5] bg-[#FBFDFF]">
              {/* Browser Header */}
              <div className="flex h-10 items-center justify-between border-b border-[#E5F0F5] px-3 sm:h-12 sm:px-5">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#D9EAF2] sm:h-2.5 sm:w-2.5" />
                  <div className="h-2 w-2 rounded-full bg-[#D9EAF2] sm:h-2.5 sm:w-2.5" />
                  <div className="h-2 w-2 rounded-full bg-[#D9EAF2] sm:h-2.5 sm:w-2.5" />
                </div>

                <span className="hidden text-[10px] text-[#9FB3C8] sm:block sm:text-xs">
                  edgecheck.app/dashboard
                </span>

                <div className="w-8 sm:w-12" />
              </div>

              {/* Dashboard */}
              <div className="grid min-h-[320px] lg:min-h-[440px] lg:grid-cols-[210px_minmax(0,1fr)]">
                {/* Sidebar */}
                <div className="hidden border-r border-[#E5F0F5] bg-white p-5 lg:block">
                  {/* Dashboard Logo */}
                  <div className="mb-8 flex items-center gap-2">
                    <div className="relative h-8 w-8 overflow-hidden rounded-lg">
                      <Image
  src="/edgecheck-icon.png"
  alt="EdgeCheck"
  fill
  unoptimized
  sizes="36px"
  className="object-contain"
/>
                    </div>

                    <span className="text-sm font-bold text-[#102A43]">
                      Edge<span className="text-[#1597D4]">Check</span>
                    </span>
                  </div>

                  {/* Sidebar Navigation */}
                  <div className="space-y-2">
                    <div className="rounded-lg bg-[#EAF7FC] px-3 py-2 text-xs font-semibold text-[#1597D4]">
                      Strategies
                    </div>

                    <div className="px-3 py-2 text-xs text-[#9FB3C8]">
                      Analysis
                    </div>

                    <div className="px-3 py-2 text-xs text-[#9FB3C8]">
                      History
                    </div>
                  </div>

                  {/* Free Usage */}
                  <div className="mt-32 rounded-xl border border-[#D9EAF2] bg-[#F7FBFD] p-3">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-[#9FB3C8]">
                      Free plan
                    </p>

                    <div className="mt-3">
                      <div className="flex items-end justify-between">
                        <span className="text-sm font-semibold text-[#102A43]">
                          Strategies
                        </span>

                        <span className="text-[10px] text-[#627D98]">
                          2 / 3
                        </span>
                      </div>

                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#D9EAF2]">
                        <div className="h-full w-2/3 rounded-full bg-[#1597D4]" />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-end justify-between">
                        <span className="text-sm font-semibold text-[#102A43]">
                          Analyses
                        </span>

                        <span className="text-[10px] text-[#627D98]">
                          3 / 5 today
                        </span>
                      </div>

                      <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#D9EAF2]">
                        <div className="h-full w-3/5 rounded-full bg-[#1597D4]" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="min-w-0 p-4 sm:p-6 md:p-8">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#9FB3C8] sm:text-xs">
                        Strategy library
                      </p>

                      <h2 className="mt-1 text-lg font-bold text-[#102A43] sm:mt-2 sm:text-xl">
                        Your strategies
                      </h2>
                    </div>

                    <button className="shrink-0 rounded-lg bg-[#1597D4] px-3 py-2 text-[10px] font-semibold text-white sm:px-4 sm:text-xs">
                      + New Strategy
                    </button>
                  </div>

                  {/* Strategy Cards */}
                  <div className="mt-5 grid gap-3 sm:mt-7 sm:gap-4 md:grid-cols-3">
                    {strategies.map((strategy) => (
                      <StrategyCard
                        key={strategy.name}
                        name={strategy.name}
                        description={strategy.description}
                      />
                    ))}
                  </div>

                  {/* Analysis */}
                  <div className="mt-4 grid min-w-0 gap-4 sm:mt-6 md:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)]">
                    {/* Chart */}
                    <div className="relative h-40 overflow-hidden rounded-xl border border-[#D9EAF2] bg-white sm:h-48">
                      <Chart />
                    </div>

                    {/* Match Result */}
                    <div className="rounded-xl border border-[#D9EAF2] bg-white p-4 sm:p-5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-medium text-[#627D98] sm:text-xs">
                          Strategy match
                        </span>

                        <span className="rounded-full bg-[#E8F8F2] px-2 py-1 text-[9px] font-semibold text-[#159A72]">
                          Strong match
                        </span>
                      </div>

                      <div className="mt-2 text-3xl font-bold tracking-tight text-[#102A43] sm:mt-3 sm:text-4xl">
                        82%
                      </div>

                      <div className="mt-4 space-y-2 text-[10px] sm:mt-5 sm:text-xs">
                        <Condition text="Resistance breakout" />
                        <Condition text="Retest detected" />
                        <Condition text="Support holding" />
                        <Condition
                          text="Bullish confirmation"
                          warning
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[10px] text-[#9FB3C8] sm:text-xs">
            Example interface shown for demonstration purposes.
          </p>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section
        id="how-it-works"
        className="border-y border-[#E5F0F5] bg-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="From an idea to a market setup."
            description="Define the way you trade, save your strategy, and compare it with current market conditions."
          />

          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-[#D9EAF2] bg-[#D9EAF2] md:grid-cols-2 lg:grid-cols-4">
            <Step
              number="01"
              title="Define Your Strategy"
              description="Describe your trading idea in your own words. AI identifies the key conditions behind your setup."
            />

            <Step
              number="02"
              title="Save Your Edge"
              description="Give your strategy a name and build a personal library of the setups you want to track."
            />

            <Step
              number="03"
              title="Analyze the Market"
              description="Choose your timeframe and upload a screenshot of the current market structure."
            />

            <Step
              number="04"
              title="Understand the Setup"
              description="Review the strategy match, relevant levels, matched conditions, and areas requiring confirmation."
            />
          </div>
        </div>
      </section>

      {/* =========================================================
          STRATEGY LIBRARY
      ========================================================= */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Text */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1597D4]">
              Your strategy library
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#102A43] sm:text-5xl">
              Your rules.
              <br />
              <span className="text-[#1597D4]">Your edge.</span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#627D98]">
              Keep your trading ideas organized in one place. EdgeCheck
              transforms natural-language ideas into structured strategies you
              can return to and analyze.
            </p>

            <Link
              href="/signup"
              className="mt-8 inline-flex rounded-xl bg-[#1597D4] px-6 py-3 text-sm font-semibold text-white shadow-md shadow-[#1597D4]/15 transition hover:bg-[#1086BE]"
            >
              Create Your First Strategy
            </Link>
          </div>

          {/* Strategy List */}
          <div className="space-y-3">
            {strategies.map((strategy, index) => (
              <div
                key={strategy.name}
                className="group flex items-center justify-between rounded-xl border border-[#D9EAF2] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#B9D8E7] hover:shadow-md"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#EAF7FC] text-xs font-semibold text-[#1597D4]">
                    0{index + 1}
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#102A43]">
                      {strategy.name}
                    </h3>

                    <p className="mt-1 truncate text-xs text-[#829AB1]">
                      {strategy.description}
                    </p>
                  </div>
                </div>

                <span className="ml-4 shrink-0 text-[#B9D8E7] transition group-hover:translate-x-1 group-hover:text-[#1597D4]">
                  →
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          PRICING
      ========================================================= */}
      <section className="border-y border-[#E5F0F5] bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
          {/* Heading */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1597D4]">
              EdgeCheck Plans
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#102A43] sm:text-5xl">
              Start free. Go deeper when you need to.
            </h2>

            <p className="mt-5 text-base leading-7 text-[#627D98]">
              Build your strategy library for free, then unlock more strategies,
              more daily analyses, and deeper market insights with Premium.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto mt-14 grid max-w-5xl gap-5 md:grid-cols-2">
            {/* Free */}
            <PricingCard
              title="Free"
              description="Everything you need to start building and testing your trading ideas."
              features={[
                "Up to 3 active strategies",
                "5 market analyses per day",
                "Basic strategy matching",
                "Key market levels",
                "Matched conditions",
                "Delete and replace strategies",
              ]}
              button="Get Started"
              href="/signup"
            />

            {/* Premium */}
            <PricingCard
              title="Premium"
              description="More capacity and deeper analysis for traders who want more from EdgeCheck."
              features={[
                "Up to 25 active strategies",
                "50 market analyses per day",
                "Advanced strategy matching",
                "Expanded market levels",
                "Detailed market structure analysis",
                "Detailed matched & missing conditions",
                "Expanded AI market insights",
                "Full analysis history",
              ]}
              button="Upgrade to Premium"
              href="/pricing"
              featured
            />
          </div>

          <p className="mx-auto mt-8 max-w-xl text-center text-xs leading-5 text-[#9FB3C8]">
            Premium features provide additional analysis and capacity. AI-generated
            analysis does not guarantee trading outcomes or investment returns.
          </p>
        </div>
      </section>

      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="mx-auto max-w-5xl px-6 py-28 text-center lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1597D4]">
          Start with an idea
        </p>

        <h2 className="mt-5 text-4xl font-bold tracking-tight text-[#102A43] sm:text-6xl">
          Define it.
          <br />
          Save it.
          <br />
          <span className="text-[#1597D4]">EdgeCheck it.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#627D98]">
          Build a personal library of your trading strategies and evaluate
          market setups against the rules you actually trade.
        </p>

        <Link
          href="/signup"
          className="mt-9 inline-flex rounded-xl bg-[#1597D4] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1597D4]/20 transition hover:bg-[#1086BE]"
        >
          Start Building Your Edge
        </Link>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-[#E5F0F5] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg">
              <Image
  src="/edgecheck-icon.png"
  alt="EdgeCheck"
  fill
  unoptimized
  sizes="36px"
  className="object-contain"
/>
            </div>

            <div>
              <div className="font-bold text-[#102A43]">
                Edge<span className="text-[#1597D4]">Check</span>
              </div>

              <p className="mt-0.5 text-xs text-[#9FB3C8]">
                AI-powered strategy analysis
              </p>
            </div>
          </div>

          <p className="text-xs text-[#9FB3C8]">
            © {new Date().getFullYear()} EdgeCheck
          </p>
        </div>
      </footer>
    </main>
  );
}

/* =============================================================
   STRATEGY CARD
============================================================= */

function StrategyCard({
  name,
  description,
}: {
  name: string;
  description: string;
}) {
  return (
    <div className="group min-w-0 rounded-xl border border-[#D9EAF2] bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#B9D8E7] hover:shadow-md">
      <div className="mb-5 h-20 overflow-hidden rounded-lg border border-[#E5F0F5] bg-[#F7FBFD]">
        <MiniChart />
      </div>

      <h3 className="text-sm font-semibold text-[#102A43]">{name}</h3>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#829AB1]">
        {description}
      </p>
    </div>
  );
}

/* =============================================================
   CONDITION
============================================================= */

function Condition({
  text,
  warning = false,
}: {
  text: string;
  warning?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] ${
          warning
            ? "bg-[#FFF4D6] text-[#B7791F]"
            : "bg-[#E8F8F2] text-[#159A72]"
        }`}
      >
        {warning ? "!" : "✓"}
      </span>

      <span className="truncate text-[#627D98]">{text}</span>
    </div>
  );
}

/* =============================================================
   MINI CHART
============================================================= */

function MiniChart() {
  return (
    <svg
      viewBox="0 0 300 100"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <path
        d="M0 75 L25 67 L45 72 L65 48 L82 55 L105 35 L125 43 L145 28 L165 38 L185 20 L205 30 L225 15 L245 25 L265 10 L300 18"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-[#1597D4]"
      />

      <path
        d="M0 82 L300 30"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="5 5"
        className="text-[#B9D8E7]"
      />
    </svg>
  );
}

/* =============================================================
   MAIN CHART
============================================================= */

function Chart() {
  return (
    <svg
      viewBox="0 0 800 300"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      {/* Grid */}
      <g className="text-[#EAF2F6]">
        <line x1="0" y1="60" x2="800" y2="60" stroke="currentColor" />
        <line x1="0" y1="120" x2="800" y2="120" stroke="currentColor" />
        <line x1="0" y1="180" x2="800" y2="180" stroke="currentColor" />
        <line x1="0" y1="240" x2="800" y2="240" stroke="currentColor" />
      </g>

      {/* Trendline */}
      <line
        x1="40"
        y1="245"
        x2="760"
        y2="75"
        stroke="currentColor"
        strokeDasharray="8 8"
        className="text-[#8FCBE3]"
      />

      {/* Price */}
      <path
        d="M20 235 L70 210 L110 225 L155 170 L195 195 L240 130 L285 155 L330 105 L375 145 L420 95 L465 120 L510 75 L555 110 L600 65 L645 92 L690 52 L735 75 L780 40"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        className="text-[#1597D4]"
      />

      {/* Support */}
      <line
        x1="30"
        y1="235"
        x2="760"
        y2="235"
        stroke="currentColor"
        strokeDasharray="6 6"
        className="text-[#D9EAF2]"
      />
    </svg>
  );
}

/* =============================================================
   SECTION HEADING
============================================================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1597D4]">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-4xl font-bold tracking-tight text-[#102A43] sm:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-[#627D98]">
        {description}
      </p>
    </div>
  );
}

/* =============================================================
   STEP
============================================================= */

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-7 lg:p-8">
      <span className="text-xs font-bold text-[#1597D4]">{number}</span>

      <h3 className="mt-10 text-sm font-bold text-[#102A43]">{title}</h3>

      <p className="mt-3 text-sm leading-6 text-[#627D98]">{description}</p>
    </div>
  );
}

/* =============================================================
   PRICING CARD
============================================================= */

function PricingCard({
  title,
  description,
  features,
  button,
  href,
  featured = false,
}: {
  title: string;
  description: string;
  features: string[];
  button: string;
  href: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-7 ${
        featured
          ? "border-[#1597D4]/40 bg-[#F5FBFE] shadow-lg shadow-[#1597D4]/10"
          : "border-[#D9EAF2] bg-white shadow-sm"
      }`}
    >
      {featured && (
        <div className="mb-5 inline-flex rounded-full bg-[#EAF7FC] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1597D4]">
          Premium
        </div>
      )}

      <h3 className="text-lg font-bold text-[#102A43]">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-[#627D98]">
        {description}
      </p>

      <div className="my-7 h-px bg-[#E5F0F5]" />

      <ul className="space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 text-sm text-[#486581]"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EAF7FC] text-[10px] font-bold text-[#1597D4]">
              ✓
            </span>

            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`mt-8 block rounded-xl px-5 py-3 text-center text-sm font-semibold transition ${
          featured
            ? "bg-[#1597D4] text-white shadow-md shadow-[#1597D4]/20 hover:bg-[#1086BE]"
            : "border border-[#D9EAF2] bg-white text-[#486581] hover:border-[#B9D8E7] hover:text-[#102A43]"
        }`}
      >
        {button}
      </Link>
    </div>
  );
}