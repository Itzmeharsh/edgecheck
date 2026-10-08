import Image from "next/image";
import Link from "next/link";
import PremiumButton from "@/components/premium-button";
import TechnicalFlow from "@/components/technical-flow";

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

const tickerItems = [
  "Breakout Retest",
  "Trendline Bounce",
  "Support Reversal",
  "Range Fade",
  "Higher-Low Continuation",
  "Double Bottom",
  "Liquidity Sweep",
  "Supply Zone Rejection",
  "Flag Breakout",
  "Moving Average Pullback",
];

/* Keyframes + helper classes. Pure CSS so this stays a Server Component. */
const css = `
@keyframes ec-drift-a { 0%,100% { transform: translate3d(0,0,0) scale(1);} 50% { transform: translate3d(80px,60px,0) scale(1.15);} }
@keyframes ec-drift-b { 0%,100% { transform: translate3d(0,0,0) scale(1);} 50% { transform: translate3d(-90px,40px,0) scale(1.2);} }
@keyframes ec-drift-c { 0%,100% { transform: translate3d(0,0,0) scale(1);} 50% { transform: translate3d(50px,-70px,0) scale(1.1);} }
@keyframes ec-float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-14px);} }
@keyframes ec-float-rev { 0%,100% { transform: translateY(0);} 50% { transform: translateY(12px);} }
@keyframes ec-grad { 0% { background-position: 0% 50%;} 100% { background-position: 200% 50%;} }
@keyframes ec-draw { from { stroke-dashoffset: 1;} to { stroke-dashoffset: 0;} }
@keyframes ec-scan { 0% { left: -10%; opacity: 0;} 10% { opacity: 1;} 90% { opacity: 1;} 100% { left: 105%; opacity: 0;} }
@keyframes ec-marquee { from { transform: translateX(0);} to { transform: translateX(-50%);} }
@keyframes ec-spin { to { transform: rotate(360deg);} }
@keyframes ec-ping { 0% { transform: scale(.6); opacity: .9;} 100% { transform: scale(2.6); opacity: 0;} }
@keyframes ec-gauge { from { stroke-dashoffset: 226.2;} to { stroke-dashoffset: 40.7;} }
@keyframes ec-shine { 0% { transform: translateX(-120%) skewX(-20deg);} 60%,100% { transform: translateX(260%) skewX(-20deg);} }
@keyframes ec-rise { from { opacity: 0; transform: translateY(26px);} to { opacity: 1; transform: translateY(0);} }
@keyframes ec-tilt-in { from { opacity: 0; transform: perspective(1600px) rotateX(24deg) translateY(60px) scale(.94);} to { opacity: 1; transform: perspective(1600px) rotateX(7deg) translateY(0) scale(1);} }
@keyframes ec-bar { from { transform: scaleX(0);} to { transform: scaleX(1);} }
@keyframes ec-twinkle { 0%,100% { opacity: .2;} 50% { opacity: 1;} }

.ec-drift-a { animation: ec-drift-a 18s ease-in-out infinite; }
.ec-drift-b { animation: ec-drift-b 22s ease-in-out infinite; }
.ec-drift-c { animation: ec-drift-c 26s ease-in-out infinite; }
.ec-float { animation: ec-float 6s ease-in-out infinite; }
.ec-float-rev { animation: ec-float-rev 7s ease-in-out infinite; }
.ec-gradtext {
  background-image: linear-gradient(90deg,#1597D4,#18C7B5,#6E7BFF,#1597D4);
  background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: ec-grad 6s linear infinite;
}
.ec-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: ec-draw 3.2s .6s cubic-bezier(.6,.1,.2,1) forwards; }
.ec-scan { animation: ec-scan 5s 3.6s ease-in-out infinite; }
.ec-marquee { animation: ec-marquee 38s linear infinite; }
.ec-marquee:hover { animation-play-state: paused; }
.ec-spin { animation: ec-spin 6s linear infinite; }
.ec-spin-slow { animation: ec-spin 40s linear infinite; }
.ec-ping { animation: ec-ping 2.2s ease-out infinite; }
.ec-gauge { stroke-dasharray: 226.2; stroke-dashoffset: 226.2; animation: ec-gauge 2s 1.6s cubic-bezier(.2,.8,.2,1) forwards; }
.ec-shine::after {
  content: ""; position: absolute; inset: 0; width: 40%;
  background: linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);
  animation: ec-shine 3.4s ease-in-out infinite;
}
.ec-rise { opacity: 0; animation: ec-rise .9s cubic-bezier(.2,.8,.2,1) forwards; }
.ec-tilt-in { opacity: 0; animation: ec-tilt-in 1.4s .5s cubic-bezier(.2,.8,.2,1) forwards; }
.ec-bar { transform-origin: left; animation: ec-bar 1.6s 1.4s cubic-bezier(.2,.8,.2,1) both; }
.ec-twinkle { animation: ec-twinkle 3s ease-in-out infinite; }
.ec-mask-fade { -webkit-mask-image: linear-gradient(to right,transparent,#000 12%,#000 88%,transparent); mask-image: linear-gradient(to right,transparent,#000 12%,#000 88%,transparent); }
.ec-grid-mask { -webkit-mask-image: radial-gradient(ellipse 70% 55% at 50% 30%,#000 30%,transparent 80%); mask-image: radial-gradient(ellipse 70% 55% at 50% 30%,#000 30%,transparent 80%); }

@media (prefers-reduced-motion: reduce) {
  .ec-drift-a,.ec-drift-b,.ec-drift-c,.ec-float,.ec-float-rev,.ec-gradtext,.ec-scan,
  .ec-marquee,.ec-spin,.ec-spin-slow,.ec-ping,.ec-shine::after,.ec-twinkle { animation: none !important; }
  .ec-draw { animation: none; stroke-dashoffset: 0; }
  .ec-gauge { animation: none; stroke-dashoffset: 40.7; }
  .ec-rise,.ec-tilt-in { animation: none; opacity: 1; }
  .ec-tilt-in { transform: perspective(1600px) rotateX(7deg); }
}
`;

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#F4FAFD] text-[#102A43]">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* =========================================================
          LIVING BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="ec-drift-a absolute left-[8%] top-[-160px] h-[560px] w-[560px] rounded-full bg-[#1597D4]/[0.16] blur-[110px]" />
        <div className="ec-drift-b absolute right-[-120px] top-[10%] h-[520px] w-[520px] rounded-full bg-[#6E7BFF]/[0.14] blur-[120px]" />
        <div className="ec-drift-c absolute bottom-[-160px] left-[30%] h-[560px] w-[560px] rounded-full bg-[#18C7B5]/[0.14] blur-[120px]" />
        <div className="ec-grid-mask absolute inset-0 bg-[linear-gradient(to_right,#1597D41A_1px,transparent_1px),linear-gradient(to_bottom,#1597D41A_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      {/* =========================================================
          NAVBAR
      ========================================================= */}
      <div className="sticky top-3 z-50 px-3 sm:px-6">
        <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between rounded-2xl border border-white/70 bg-white/60 px-3 shadow-[0_8px_32px_rgba(16,42,67,0.08)] backdrop-blur-xl sm:px-5">
          <Link
            href="/"
            className="relative block h-10 w-[145px] shrink-0 overflow-hidden rounded-[12px] bg-[#CDEBF5] sm:h-11 sm:w-[175px] md:w-[200px]"
          >
            <Image
              src="/edgecheck-logo.png"
              alt="EdgeCheck"
              fill
              priority
              unoptimized
              sizes="(max-width: 640px) 145px, (max-width: 768px) 175px, 200px"
              className="object-contain"
            />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-[#486581] md:flex">
            <Link href="#how-it-works" className="transition hover:text-[#1597D4]">
              How it works
            </Link>
            <Link href="#library" className="transition hover:text-[#1597D4]">
              Strategies
            </Link>
            <Link href="#pricing" className="transition hover:text-[#1597D4]">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Link
              href="/login"
              className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#627D98] transition hover:text-[#102A43] sm:px-4 sm:text-sm"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="ec-shine relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1597D4] to-[#18B5C7] px-3 py-2 text-xs font-semibold text-white shadow-md shadow-[#1597D4]/30 transition hover:scale-[1.04] sm:px-4 sm:text-sm"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative mx-auto flex w-full max-w-7xl flex-col items-center px-4 pb-16 pt-14 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        {/* Robot logo with orbit rings */}
        <div className="ec-rise relative mb-8 flex items-center justify-center">
          <div className="ec-spin-slow absolute h-[170px] w-[170px] rounded-full border border-dashed border-[#1597D4]/30 sm:h-[200px] sm:w-[200px]" />
          <div className="ec-spin absolute h-[140px] w-[140px] rounded-full border border-transparent border-t-[#1597D4] sm:h-[164px] sm:w-[164px]" />
          <div className="ec-ping absolute h-[100px] w-[100px] rounded-full border border-[#1597D4]/40" />
          <div className="ec-float relative h-[82px] w-[82px] overflow-hidden rounded-[22px] bg-[#CDEBF5] shadow-xl shadow-[#1597D4]/25 sm:h-[96px] sm:w-[96px] md:h-[108px] md:w-[108px]">
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
        </div>

        {/* Badge */}
        <div
          className="ec-rise inline-flex items-center gap-2 rounded-full border border-[#D9EAF2] bg-white/80 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#627D98] shadow-sm backdrop-blur sm:px-4 sm:text-xs sm:tracking-[0.16em]"
          style={{ animationDelay: ".1s" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="ec-ping absolute inline-flex h-full w-full rounded-full bg-[#1597D4]" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1597D4]" />
          </span>
          AI-powered strategy analysis
        </div>

        {/* Heading */}
        <h1
          className="ec-rise mt-8 max-w-5xl px-2 text-4xl font-extrabold leading-[1.02] tracking-[-0.045em] text-[#102A43] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[88px]"
          style={{ animationDelay: ".2s" }}
        >
          Think you&apos;re on the
          <br />
          <span className="ec-gradtext">edge of trading?</span>
        </h1>

        {/* Tagline */}
        <p
          className="ec-rise mt-6 text-xl font-semibold tracking-tight text-[#102A43] sm:text-2xl md:text-3xl"
          style={{ animationDelay: ".3s" }}
        >
          EdgeCheck yourself.
        </p>

        {/* Description */}
        <p
          className="ec-rise mt-5 max-w-2xl text-sm leading-6 text-[#627D98] sm:text-base sm:leading-7 md:text-lg"
          style={{ animationDelay: ".4s" }}
        >
          Turn your trading ideas into structured strategies and evaluate them
          against real market conditions with AI-powered analysis.
        </p>

        {/* CTA */}
        <div
          className="ec-rise mt-9 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center"
          style={{ animationDelay: ".5s" }}
        >
          <Link
            href="/signup"
            className="ec-shine group relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#1597D4] via-[#17A9CC] to-[#18B5C7] px-7 py-4 text-center text-sm font-semibold text-white shadow-[0_14px_40px_rgba(21,151,212,0.45)] transition hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(21,151,212,0.6)]"
          >
            Start Building Your Edge
          </Link>

          <Link
            href="#how-it-works"
            className="rounded-2xl border border-[#D9EAF2] bg-white/80 px-7 py-4 text-center text-sm font-semibold text-[#486581] shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-[#1597D4]/50 hover:text-[#102A43]"
          >
            See How It Works
          </Link>
        </div>

        {/* =====================================================
            PRODUCT PREVIEW — 3D TILT + FLOATING CHIPS
        ===================================================== */}
        <div className="relative mt-16 w-full max-w-6xl sm:mt-20 lg:mt-24">
          {/* glow under the dashboard */}
          <div className="absolute inset-x-10 -bottom-10 h-40 rounded-full bg-[#1597D4]/30 blur-3xl" />

          {/* Floating chips */}
          <div className="ec-float absolute -left-6 top-24 z-20 hidden items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 text-left shadow-[0_20px_50px_rgba(16,42,67,0.15)] backdrop-blur xl:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E8F8F2] text-sm font-bold text-[#159A72]">
              ✓
            </span>
            <div>
              <p className="text-xs font-bold text-[#102A43]">Retest detected</p>
              <p className="text-[10px] text-[#829AB1]">Key level held</p>
            </div>
          </div>

          <div className="ec-float-rev absolute -right-6 top-44 z-20 hidden items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 text-left shadow-[0_20px_50px_rgba(16,42,67,0.15)] backdrop-blur xl:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EAF7FC] text-sm font-bold text-[#1597D4]">
              AI
            </span>
            <div>
              <p className="text-xs font-bold text-[#102A43]">Screenshot analyzed</p>
              <p className="text-[10px] text-[#829AB1]">4H timeframe</p>
            </div>
          </div>

          <div className="ec-float absolute -right-2 bottom-24 z-20 hidden items-center gap-3 rounded-2xl border border-white bg-white/90 px-4 py-3 text-left shadow-[0_20px_50px_rgba(16,42,67,0.15)] backdrop-blur xl:flex">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF4D6] text-sm font-bold text-[#B7791F]">
              !
            </span>
            <div>
              <p className="text-xs font-bold text-[#102A43]">Needs confirmation</p>
              <p className="text-[10px] text-[#829AB1]">Bullish candle pending</p>
            </div>
          </div>

          <div className="ec-tilt-in relative">
            <div className="rounded-2xl border border-white/80 bg-white/70 p-1.5 shadow-[0_40px_100px_rgba(16,42,67,0.18)] backdrop-blur sm:p-2">
              <div className="overflow-hidden rounded-xl border border-[#E5F0F5] bg-[#FBFDFF]">
                {/* Browser header */}
                <div className="flex h-10 items-center justify-between border-b border-[#E5F0F5] bg-white px-3 sm:h-12 sm:px-5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#FF8A80] sm:h-2.5 sm:w-2.5" />
                    <div className="h-2 w-2 rounded-full bg-[#FFD27A] sm:h-2.5 sm:w-2.5" />
                    <div className="h-2 w-2 rounded-full bg-[#7AD9A8] sm:h-2.5 sm:w-2.5" />
                  </div>

                  <span className="hidden rounded-md bg-[#F2F8FB] px-4 py-1 text-[10px] text-[#9FB3C8] sm:block sm:text-xs">
                    edgecheck.app/dashboard
                  </span>

                  <div className="w-8 sm:w-12" />
                </div>

                {/* Dashboard */}
                <div className="grid min-h-[320px] lg:min-h-[440px] lg:grid-cols-[210px_minmax(0,1fr)]">
                  {/* Sidebar */}
                  <div className="hidden border-r border-[#E5F0F5] bg-white p-5 text-left lg:block">
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

                    <div className="space-y-2">
                      <div className="rounded-lg bg-[#EAF7FC] px-3 py-2 text-xs font-semibold text-[#1597D4]">
                        Strategies
                      </div>
                      <div className="px-3 py-2 text-xs text-[#9FB3C8]">Analysis</div>
                      <div className="px-3 py-2 text-xs text-[#9FB3C8]">History</div>
                    </div>

                    <div className="mt-32 rounded-xl border border-[#D9EAF2] bg-[#F7FBFD] p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-[#9FB3C8]">
                        Free plan
                      </p>

                      <div className="mt-3">
                        <div className="flex items-end justify-between">
                          <span className="text-sm font-semibold text-[#102A43]">Strategies</span>
                          <span className="text-[10px] text-[#627D98]">2 / 3</span>
                        </div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#D9EAF2]">
                          <div className="ec-bar h-full w-2/3 rounded-full bg-gradient-to-r from-[#1597D4] to-[#18C7B5]" />
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex items-end justify-between">
                          <span className="text-sm font-semibold text-[#102A43]">Analyses</span>
                          <span className="text-[10px] text-[#627D98]">3 / 5 today</span>
                        </div>
                        <div className="mt-2 h-1 overflow-hidden rounded-full bg-[#D9EAF2]">
                          <div className="ec-bar h-full w-3/5 rounded-full bg-gradient-to-r from-[#1597D4] to-[#18C7B5]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="min-w-0 p-4 text-left sm:p-6 md:p-8">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-medium uppercase tracking-wider text-[#9FB3C8] sm:text-xs">
                          Strategy library
                        </p>
                        <h2 className="mt-1 text-lg font-bold text-[#102A43] sm:mt-2 sm:text-xl">
                          Your strategies
                        </h2>
                      </div>

                      <button className="shrink-0 rounded-lg bg-[#1597D4] px-3 py-2 text-[10px] font-semibold text-white shadow-md shadow-[#1597D4]/30 sm:px-4 sm:text-xs">
                        + New Strategy
                      </button>
                    </div>

                    <div className="mt-5 grid gap-3 sm:mt-7 sm:gap-4 md:grid-cols-3">
                      {strategies.map((strategy) => (
                        <StrategyCard
                          key={strategy.name}
                          name={strategy.name}
                          description={strategy.description}
                        />
                      ))}
                    </div>

                    <div className="mt-4 grid min-w-0 gap-4 sm:mt-6 md:grid-cols-[minmax(0,1.3fr)_minmax(220px,0.7fr)]">
                      {/* Chart with scanner */}
                      <div className="relative h-44 overflow-hidden rounded-xl border border-[#D9EAF2] bg-white sm:h-52">
                        <Chart />

                        {/* scan beam */}
                        <div className="ec-scan pointer-events-none absolute top-0 h-full w-16 bg-gradient-to-r from-transparent via-[#1597D4]/25 to-transparent" />

                        {/* markers */}
                        <Marker left="41%" top="35%" label="Breakout" />
                        <Marker left="47%" top="48%" label="Retest" below />

                        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#102A43] px-2.5 py-1 text-[9px] font-semibold text-white">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#18C7B5] ec-twinkle" />
                          Scanning
                        </span>
                      </div>

                      {/* Match result with gauge */}
                      <div className="rounded-xl border border-[#D9EAF2] bg-white p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-medium text-[#627D98] sm:text-xs">
                            Strategy match
                          </span>
                          <span className="rounded-full bg-[#E8F8F2] px-2 py-1 text-[9px] font-semibold text-[#159A72]">
                            Strong match
                          </span>
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <div className="relative h-[84px] w-[84px] shrink-0">
                            <svg viewBox="0 0 84 84" className="h-full w-full -rotate-90">
                              <circle cx="42" cy="42" r="36" fill="none" stroke="#E5F0F5" strokeWidth="7" />
                              <circle
                                cx="42"
                                cy="42"
                                r="36"
                                fill="none"
                                stroke="url(#ecGauge)"
                                strokeWidth="7"
                                strokeLinecap="round"
                                className="ec-gauge"
                              />
                              <defs>
                                <linearGradient id="ecGauge" x1="0" y1="0" x2="1" y2="1">
                                  <stop offset="0%" stopColor="#1597D4" />
                                  <stop offset="100%" stopColor="#18C7B5" />
                                </linearGradient>
                              </defs>
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-xl font-extrabold tracking-tight text-[#102A43]">
                              82%
                            </div>
                          </div>

                          <div className="min-w-0 flex-1 space-y-2 text-[10px] sm:text-xs">
                            <Condition text="Resistance breakout" />
                            <Condition text="Retest detected" />
                            <Condition text="Support holding" />
                            <Condition text="Bullish confirmation" warning />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="relative mt-6 text-[10px] text-[#9FB3C8] sm:text-xs">
            Example interface shown for demonstration purposes.
          </p>
        </div>
      </section>

      {/* =========================================================
          STRATEGY TICKER
      ========================================================= */}
      <section className="relative border-y border-[#D9EAF2] bg-white/70 py-5 backdrop-blur">
        <div className="ec-mask-fade overflow-hidden">
          <div className="ec-marquee flex w-max items-center gap-4 pr-4">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <div
                key={i}
                className="flex shrink-0 items-center gap-3 rounded-full border border-[#D9EAF2] bg-white px-5 py-2 text-sm font-semibold text-[#486581] shadow-sm"
              >
                <span className="h-2 w-2 rounded-full bg-gradient-to-br from-[#1597D4] to-[#18C7B5]" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================
          HOW IT WORKS
      ========================================================= */}
      <section id="how-it-works" className="relative">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title="From an idea to a market setup."
            description="Define the way you trade, save your strategy, and compare it with current market conditions."
          />

          <div className="relative mt-16">
            {/* connecting line */}
            <div className="absolute left-0 right-0 top-[52px] hidden h-px bg-gradient-to-r from-transparent via-[#1597D4]/50 to-transparent lg:block" />

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Step
                number="01"
                title="Define Your Strategy"
                description="Describe your trading idea in your own words. AI identifies the key conditions behind your setup."
                icon={
                  <path d="M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4" />
                }
              />
              <Step
                number="02"
                title="Save Your Edge"
                description="Give your strategy a name and build a personal library of the setups you want to track."
                icon={
                  <path d="M6 3h12v18l-6-4-6 4V3z" />
                }
              />
              <Step
                number="03"
                title="Analyze the Market"
                description="Choose your timeframe and upload a screenshot of the current market structure."
                icon={
                  <>
                    <path d="M4 7h3l2-3h6l2 3h3v13H4V7z" />
                    <circle cx="12" cy="13" r="3.5" />
                  </>
                }
              />
              <Step
                number="04"
                title="Understand the Setup"
                description="Review the strategy match, relevant levels, matched conditions, and areas requiring confirmation."
                icon={
                  <path d="M4 17l5-5 4 4 7-8M15 8h5v5" />
                }
              />
            </div>
          </div>
        </div>
      </section>

      <TechnicalFlow />

      {/* =========================================================
          STRATEGY LIBRARY
      ========================================================= */}
      <section id="library" className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1597D4]">
              Your strategy library
            </p>

            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#102A43] sm:text-6xl">
              Your rules.
              <br />
              <span className="ec-gradtext">Your edge.</span>
            </h2>

            <p className="mt-6 max-w-lg text-base leading-7 text-[#627D98]">
              Keep your trading ideas organized in one place. EdgeCheck
              transforms natural-language ideas into structured strategies you
              can return to and analyze.
            </p>

            <Link
              href="/signup"
              className="ec-shine relative mt-8 inline-flex overflow-hidden rounded-2xl bg-gradient-to-r from-[#1597D4] to-[#18B5C7] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#1597D4]/30 transition hover:-translate-y-0.5"
            >
              Create Your First Strategy
            </Link>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-[#1597D4]/10 via-transparent to-[#18C7B5]/10 blur-2xl" />

            <div className="relative space-y-3">
              {strategies.map((strategy, index) => (
                <div
                  key={strategy.name}
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-[#D9EAF2] bg-white/90 p-4 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:translate-x-1 hover:border-[#1597D4]/50 hover:shadow-[0_18px_40px_rgba(21,151,212,0.18)]"
                  style={{ marginLeft: `${index * 14}px` }}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-[#E5F0F5] bg-[#F7FBFD]">
                      <MiniChart />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#102A43]">{strategy.name}</h3>
                      <p className="mt-1 truncate text-xs text-[#829AB1]">
                        {strategy.description}
                      </p>
                    </div>
                  </div>

                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF7FC] text-[#1597D4] transition group-hover:translate-x-1 group-hover:bg-[#1597D4] group-hover:text-white">
                    →
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PRICING
      ========================================================= */}
      <section id="pricing" className="relative border-y border-[#E5F0F5] bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#1597D4]">
              EdgeCheck Plans
            </p>

            <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#102A43] sm:text-5xl">
              Start free. Go deeper when you need to.
            </h2>

            <p className="mt-5 text-base leading-7 text-[#627D98]">
              Build your strategy library for free, then unlock more strategies,
              more daily analyses, and deeper market insights with Premium.
            </p>
          </div>

          <div className="mx-auto mt-14 grid max-w-5xl items-stretch gap-6 md:grid-cols-2">
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
          FINAL CTA — DARK SPOTLIGHT PANEL
      ========================================================= */}
      <section className="mx-auto max-w-6xl px-4 py-28 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[32px] bg-[#06182A] px-6 py-24 text-center shadow-[0_40px_120px_rgba(6,24,42,0.45)] sm:px-12">
          {/* glows */}
          <div className="ec-drift-a absolute -left-20 -top-20 h-[360px] w-[360px] rounded-full bg-[#1597D4]/40 blur-[100px]" />
          <div className="ec-drift-b absolute -bottom-24 -right-20 h-[380px] w-[380px] rounded-full bg-[#6E7BFF]/35 blur-[110px]" />
          <div className="ec-drift-c absolute bottom-0 left-1/3 h-[260px] w-[260px] rounded-full bg-[#18C7B5]/30 blur-[100px]" />

          {/* grid */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0D_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0D_1px,transparent_1px)] bg-[size:48px_48px]" />

          {/* rings */}
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="ec-spin-slow h-[620px] w-[620px] rounded-full border border-dashed border-white/10" />
          </div>
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="ec-spin-slow h-[420px] w-[420px] rounded-full border border-white/10" style={{ animationDirection: "reverse" }} />
          </div>

          {/* stars */}
          {[
            ["12%", "20%", "0s"],
            ["82%", "16%", ".8s"],
            ["22%", "78%", "1.4s"],
            ["90%", "70%", "2s"],
            ["66%", "88%", "1s"],
            ["8%", "52%", "1.8s"],
          ].map(([l, t, d], i) => (
            <span
              key={i}
              className="ec-twinkle absolute h-1.5 w-1.5 rounded-full bg-white"
              style={{ left: l, top: t, animationDelay: d }}
            />
          ))}

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7FD3F2]">
              Start with an idea
            </p>

            <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl">
              Define it.
              <br />
              Save it.
              <br />
              <span className="ec-gradtext">EdgeCheck it.</span>
            </h2>

            <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-[#B6CCDD]">
              Build a personal library of your trading strategies and evaluate
              market setups against the rules you actually trade.
            </p>

            <Link
              href="/signup"
              className="ec-shine relative mt-10 inline-flex overflow-hidden rounded-2xl bg-white px-8 py-4 text-sm font-bold text-[#06182A] shadow-[0_0_60px_rgba(21,151,212,0.55)] transition hover:scale-105"
            >
              Start Building Your Edge
            </Link>
          </div>
        </div>
      </section>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="border-t border-[#E5F0F5] bg-white/80 backdrop-blur">
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
              <p className="mt-0.5 text-xs text-[#9FB3C8]">AI-powered strategy analysis</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
  <Link
    href="/privacy"
    className="text-xs text-[#78919A] transition-colors hover:text-[#1597D4]"
  >
    Privacy Policy
  </Link>

  <p className="text-xs text-[#9FB3C8]">
    © {new Date().getFullYear()} EdgeCheck
  </p>
</div>
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
    <div className="group min-w-0 rounded-xl border border-[#D9EAF2] bg-white p-4 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:border-[#1597D4]/50 hover:shadow-[0_14px_30px_rgba(21,151,212,0.18)]">
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
   CHART MARKER
============================================================= */

function Marker({
  left,
  top,
  label,
  below = false,
}: {
  left: string;
  top: string;
  label: string;
  below?: boolean;
}) {
  return (
    <div className="absolute z-10" style={{ left, top }}>
      <span className="relative flex h-3 w-3 -translate-x-1/2 -translate-y-1/2">
        <span className="ec-ping absolute inline-flex h-full w-full rounded-full bg-[#18C7B5]" />
        <span className="relative inline-flex h-3 w-3 rounded-full border-2 border-white bg-[#18C7B5] shadow" />
      </span>
      <span
        className={`absolute left-0 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#102A43] px-1.5 py-0.5 text-[8px] font-semibold text-white sm:text-[9px] ${
          below ? "top-3" : "-top-8"
        }`}
      >
        {label}
      </span>
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
      <defs>
        <linearGradient id="ecMiniFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1597D4" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1597D4" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path
        d="M0 75 L25 67 L45 72 L65 48 L82 55 L105 35 L125 43 L145 28 L165 38 L185 20 L205 30 L225 15 L245 25 L265 10 L300 18 L300 100 L0 100 Z"
        fill="url(#ecMiniFill)"
      />

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
   MAIN CHART (draws itself on load)
============================================================= */

function Chart() {
  return (
    <svg
      viewBox="0 0 800 300"
      className="h-full w-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="ecChartFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1597D4" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#1597D4" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="ecChartLine" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#1597D4" />
          <stop offset="100%" stopColor="#18C7B5" />
        </linearGradient>
      </defs>

      {/* Grid */}
      <g className="text-[#EAF2F6]">
        <line x1="0" y1="60" x2="800" y2="60" stroke="currentColor" />
        <line x1="0" y1="120" x2="800" y2="120" stroke="currentColor" />
        <line x1="0" y1="180" x2="800" y2="180" stroke="currentColor" />
        <line x1="0" y1="240" x2="800" y2="240" stroke="currentColor" />
      </g>

      {/* Area under price */}
      <path
        d="M20 235 L70 210 L110 225 L155 170 L195 195 L240 130 L285 155 L330 105 L375 145 L420 95 L465 120 L510 75 L555 110 L600 65 L645 92 L690 52 L735 75 L780 40 L780 300 L20 300 Z"
        fill="url(#ecChartFill)"
      />

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

      {/* Resistance level */}
      <line
        x1="30"
        y1="125"
        x2="780"
        y2="125"
        stroke="#18C7B5"
        strokeWidth="1.5"
        strokeDasharray="4 6"
        opacity="0.8"
      />

      {/* Price */}
      <path
        pathLength={1}
        d="M20 235 L70 210 L110 225 L155 170 L195 195 L240 130 L285 155 L330 105 L375 145 L420 95 L465 120 L510 75 L555 110 L600 65 L645 92 L690 52 L735 75 L780 40"
        fill="none"
        stroke="url(#ecChartLine)"
        strokeWidth="3.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        className="ec-draw"
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

      <h2 className="mt-4 text-4xl font-extrabold tracking-tight text-[#102A43] sm:text-5xl">
        {title}
      </h2>

      <p className="mt-5 text-base leading-7 text-[#627D98]">{description}</p>
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
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="group relative rounded-2xl border border-[#D9EAF2] bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-2 hover:border-[#1597D4]/50 hover:shadow-[0_24px_50px_rgba(21,151,212,0.2)] lg:p-8">
      {/* hover glow */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1597D4]/0 to-[#18C7B5]/0 opacity-0 transition duration-300 group-hover:from-[#1597D4]/[0.06] group-hover:to-[#18C7B5]/[0.08] group-hover:opacity-100" />

      <div className="relative flex items-center justify-between">
        <div className="relative flex h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gradient-to-br from-[#1597D4] to-[#18C7B5] text-white shadow-lg shadow-[#1597D4]/30 transition duration-300 group-hover:rotate-6 group-hover:scale-110">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {icon}
          </svg>
        </div>

        <span className="text-5xl font-black tracking-tighter text-[#1597D4]/10 transition group-hover:text-[#1597D4]/25">
          {number}
        </span>
      </div>

      <h3 className="relative mt-8 text-base font-bold text-[#102A43]">{title}</h3>

      <p className="relative mt-3 text-sm leading-6 text-[#627D98]">{description}</p>
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
  const body = (
    <div
      className={`relative h-full rounded-2xl p-7 ${
        featured ? "bg-[#F5FBFE]" : "border border-[#D9EAF2] bg-white shadow-sm"
      }`}
    >
      {featured && (
        <div className="mb-5 inline-flex rounded-full bg-gradient-to-r from-[#1597D4] to-[#18C7B5] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-[#1597D4]/30">
          Most popular
        </div>
      )}

      <h3 className="text-lg font-bold text-[#102A43]">{title}</h3>

      <p className="mt-2 text-sm leading-6 text-[#627D98]">{description}</p>

      <div className="my-7 h-px bg-[#E5F0F5]" />

      <ul className="space-y-3">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-3 text-sm text-[#486581]"
          >
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                featured
                  ? "bg-gradient-to-br from-[#1597D4] to-[#18C7B5] text-white"
                  : "bg-[#EAF7FC] text-[#1597D4]"
              }`}
            >
              ✓
            </span>
            {feature}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className={`relative mt-8 block overflow-hidden rounded-xl px-5 py-3.5 text-center text-sm font-semibold transition ${
          featured
            ? "ec-shine bg-gradient-to-r from-[#1597D4] to-[#18B5C7] text-white shadow-lg shadow-[#1597D4]/30 hover:-translate-y-0.5"
            : "border border-[#D9EAF2] bg-white text-[#486581] hover:border-[#1597D4]/50 hover:text-[#102A43]"
        }`}
      >
        {button}
      </Link>
    </div>
  );

  if (!featured) {
    return <div className="transition duration-300 hover:-translate-y-1">{body}</div>;
  }

  /* Premium: rotating conic-gradient border + glow */
  return (
    <div className="relative transition duration-300 hover:-translate-y-2">
      <div className="absolute -inset-4 rounded-[28px] bg-[#1597D4]/20 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl p-[2px]">
        <div
          className="ec-spin absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0 60%, #1597D4 75%, #18C7B5 88%, #6E7BFF 95%, transparent 100%)",
          }}
        />
        <div className="relative h-full rounded-[14px] bg-[#F5FBFE]">{body}</div>
      </div>
    </div>
  );
}
