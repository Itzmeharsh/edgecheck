"use client";

import { useEffect, useState } from "react";

const stages = [
  {
    number: "01",
    label: "MARKET DATA",
    title: "Real market conditions",
    description:
      "EdgeCheck pulls real OHLC market data from Upstox. Candles are never generated or reconstructed by AI.",
  },
  {
    number: "02",
    label: "MARKET ENGINE",
    title: "Read the setup",
    description:
      "The market engine calculates deterministic indicators and market conditions from the real OHLC data.",
  },
  {
    number: "03",
    label: "YOUR STRATEGY",
    title: "Turn ideas into rules",
    description:
      "Your natural-language strategy is interpreted into structured conditions that can be evaluated against the market.",
  },
  {
    number: "04",
    label: "AI ENGINE",
    title: "Reason across the inputs",
    description:
      "AI combines structured strategy rules, market calculations and visual chart context to evaluate compatibility.",
  },
  {
    number: "05",
    label: "EDGECHECK",
    title: "Measure the match",
    description:
      "The final result shows how closely the current market setup satisfies your strategy conditions.",
  },
];

const panels = [
  {
    eyebrow: "DATA SOURCE",
    title: "Real OHLC enters the system",
    text: "The market layer receives actual candle data instead of an AI-generated representation.",
    rows: [
      ["API", "Upstox"],
      ["DATA", "Open · High · Low · Close"],
      ["OPTIONAL", "Volume · OI"],
      ["TIMEFRAMES", "5m · 15m · 1h · 1d"],
    ],
  },
  {
    eyebrow: "DETERMINISTIC ENGINE",
    title: "Market conditions are calculated from data",
    text: "Indicator values and market-state calculations are derived programmatically from the real candles.",
    rows: [
      ["INPUT", "Real OHLC"],
      ["CALCULATIONS", "EMA · High/Low · Trend"],
      ["SOURCE OF TRUTH", "Market data"],
      ["AI ROLE", "Interpretation, not candle creation"],
    ],
  },
  {
    eyebrow: "STRATEGY ENGINE",
    title: "Natural language becomes structured rules",
    text: "A user's trading idea is converted into structured conditions so the same strategy can be evaluated consistently.",
    rows: [
      ["INPUT", "Natural-language strategy"],
      ["OUTPUT", "Structured rules"],
      ["STORED IN", "Supabase PostgreSQL"],
      ["PURPOSE", "Repeatable comparison"],
    ],
  },
  {
    eyebrow: "AI REASONING",
    title: "Multiple providers can power the analysis",
    text: "The selected AI provider reasons over the strategy rules, calculated market context and validated chart context.",
    rows: [
      ["FREE", "Gemini 3.5 Flash Lite"],
      ["BYOK", "OpenAI GPT-5 mini"],
      ["RAG", "Not used"],
      ["OUTPUT", "Compatibility analysis"],
    ],
  },
  {
    eyebrow: "RESULT",
    title: "Compatibility, not a trading signal",
    text: "EdgeCheck reports how closely the current setup satisfies the strategy conditions.",
    rows: [
      ["MATCH", "0–100%"],
      ["SHOWS", "Matched conditions"],
      ["SHOWS", "Missing conditions"],
      ["NOT", "Profit probability"],
    ],
  },
];

const STEP_MS = 3800;

const css = `
@keyframes tf-drift-a { 0%,100% { transform: translate3d(0,0,0) scale(1);} 50% { transform: translate3d(70px,50px,0) scale(1.15);} }
@keyframes tf-drift-b { 0%,100% { transform: translate3d(0,0,0) scale(1);} 50% { transform: translate3d(-80px,30px,0) scale(1.2);} }
@keyframes tf-drift-c { 0%,100% { transform: translate3d(0,0,0) scale(1);} 50% { transform: translate3d(40px,-60px,0) scale(1.1);} }
@keyframes tf-travel { from { left: 0%; opacity: 0;} 10% { opacity: 1;} 90% { opacity: 1;} to { left: 100%; opacity: 0;} }
@keyframes tf-progress { from { transform: scaleX(0);} to { transform: scaleX(1);} }
@keyframes tf-grow { from { transform: scaleY(0); opacity: 0;} to { transform: scaleY(1); opacity: 1;} }
@keyframes tf-draw { from { stroke-dashoffset: 1;} to { stroke-dashoffset: 0;} }
@keyframes tf-dash { to { stroke-dashoffset: -40;} }
@keyframes tf-ping { 0% { transform: scale(.6); opacity: .9;} 100% { transform: scale(2.8); opacity: 0;} }
@keyframes tf-spin { to { transform: rotate(360deg);} }
@keyframes tf-float { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
@keyframes tf-fade-in { from { opacity: 0; transform: translateY(14px);} to { opacity: 1; transform: translateY(0);} }
@keyframes tf-bar { from { transform: scaleX(0);} to { transform: scaleX(1);} }
@keyframes tf-twinkle { 0%,100% { opacity: .25;} 50% { opacity: 1;} }
@keyframes tf-blink { 0%,49% { opacity: 1;} 50%,100% { opacity: 0;} }
@keyframes tf-scan { 0% { top: 0%; opacity: 0;} 15% { opacity: 1;} 85% { opacity: 1;} 100% { top: 100%; opacity: 0;} }
@keyframes tf-grad { 0% { background-position: 0% 50%;} 100% { background-position: 200% 50%;} }
@keyframes tf-ring { from { stroke-dashoffset: 402.1;} to { stroke-dashoffset: 72.4;} }
@keyframes tf-rise { 0%,100% { transform: scaleY(.35);} 50% { transform: scaleY(1);} }
@keyframes tf-shimmer { 0% { transform: translateX(-120%) skewX(-20deg);} 60%,100% { transform: translateX(260%) skewX(-20deg);} }

.tf-drift-a { animation: tf-drift-a 20s ease-in-out infinite; }
.tf-drift-b { animation: tf-drift-b 25s ease-in-out infinite; }
.tf-drift-c { animation: tf-drift-c 30s ease-in-out infinite; }
.tf-travel { animation: tf-travel 2.4s linear infinite; }
.tf-progress { transform-origin: left; animation: tf-progress ${STEP_MS}ms linear forwards; }
.tf-grow { transform-box: fill-box; transform-origin: 50% 100%; animation: tf-grow .7s cubic-bezier(.2,.8,.2,1) both; }
.tf-draw { stroke-dasharray: 1; stroke-dashoffset: 1; animation: tf-draw 1.8s .2s cubic-bezier(.6,.1,.2,1) forwards; }
.tf-dash { stroke-dasharray: 5 7; animation: tf-dash 1.4s linear infinite; }
.tf-ping { transform-box: fill-box; transform-origin: center; animation: tf-ping 2.2s ease-out infinite; }
.tf-spin { animation: tf-spin 8s linear infinite; }
.tf-spin-rev { animation: tf-spin 12s linear infinite reverse; }
.tf-spin-slow { animation: tf-spin 24s linear infinite; }
.tf-float { animation: tf-float 5s ease-in-out infinite; }
.tf-fade-in { opacity: 0; animation: tf-fade-in .7s cubic-bezier(.2,.8,.2,1) forwards; }
.tf-bar { transform-origin: left; animation: tf-bar 1.4s .3s cubic-bezier(.2,.8,.2,1) both; }
.tf-twinkle { animation: tf-twinkle 2.6s ease-in-out infinite; }
.tf-blink { animation: tf-blink 1s steps(1) infinite; }
.tf-scan { animation: tf-scan 3.6s ease-in-out infinite; }
.tf-ring { stroke-dasharray: 402.1; stroke-dashoffset: 402.1; animation: tf-ring 2s .4s cubic-bezier(.2,.8,.2,1) forwards; }
.tf-rise { transform-origin: bottom; animation: tf-rise 1.8s ease-in-out infinite; }
.tf-shine { position: relative; overflow: hidden; }
.tf-shine::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg,transparent,rgba(255,255,255,.18),transparent); animation: tf-shimmer 4s ease-in-out infinite; }
.tf-gradtext {
  background-image: linear-gradient(90deg,#4CC3F5,#18C7B5,#9AA5FF,#4CC3F5);
  background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: tf-grad 6s linear infinite;
}

@media (prefers-reduced-motion: reduce) {
  .tf-drift-a,.tf-drift-b,.tf-drift-c,.tf-travel,.tf-dash,.tf-ping,.tf-spin,.tf-spin-rev,.tf-spin-slow,
  .tf-float,.tf-twinkle,.tf-blink,.tf-scan,.tf-gradtext,.tf-rise,.tf-shine::after { animation: none !important; }
  .tf-progress,.tf-grow,.tf-bar,.tf-fade-in { animation: none !important; opacity: 1; transform: none; }
  .tf-draw { animation: none; stroke-dashoffset: 0; }
  .tf-ring { animation: none; stroke-dashoffset: 72.4; }
}
`;

export default function TechnicalFlow() {
  const [activeStage, setActiveStage] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;

    const timer = window.setTimeout(() => {
      setActiveStage((current) => (current + 1) % stages.length);
    }, STEP_MS);

    return () => window.clearTimeout(timer);
  }, [activeStage, paused]);

  const progress = Math.min(activeStage / (stages.length - 1), 1) * 100;

  return (
    <section className="relative overflow-hidden bg-[#06182A]">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="tf-drift-a absolute -left-24 top-[-120px] h-[480px] w-[480px] rounded-full bg-[#1597D4]/30 blur-[110px]" />
        <div className="tf-drift-b absolute -right-24 top-[35%] h-[500px] w-[500px] rounded-full bg-[#6E7BFF]/25 blur-[120px]" />
        <div className="tf-drift-c absolute bottom-[-140px] left-[25%] h-[460px] w-[460px] rounded-full bg-[#18C7B5]/20 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0A_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0A_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:linear-gradient(to_bottom,#000,transparent_85%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-24 sm:px-6 lg:px-8 lg:py-32">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7FD3F2] backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="tf-ping absolute inline-flex h-full w-full rounded-full bg-[#18C7B5]" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#18C7B5]" />
            </span>
            EdgeCheck Architecture
          </div>

          <h2 className="mt-6 text-4xl font-extrabold leading-[1.03] tracking-[-0.045em] text-white sm:text-5xl lg:text-7xl">
            From real market data
            <br />
            <span className="tf-gradtext">to strategy compatibility.</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-[#9FB8CC]">
            EdgeCheck combines real market data, deterministic calculations,
            structured strategy rules and AI reasoning to measure how closely
            the current market matches your strategy.
          </p>
        </div>

        {/* Interactive architecture (pauses on hover) */}
        <div
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Rail */}
          <div className="relative mt-20 hidden lg:block">
            <div className="grid grid-cols-5">
              {stages.map((stage, index) => (
                <div key={stage.number} className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setActiveStage(index)}
                    aria-label={`Go to stage ${stage.number}`}
                    className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full"
                  >
                    {activeStage === index && (
                      <span className="tf-ping absolute inset-0 rounded-full border border-[#1597D4]" />
                    )}
                    <span
                      className={`flex h-full w-full items-center justify-center rounded-full border text-xs font-bold transition-all duration-500 ${
                        activeStage === index
                          ? "scale-110 border-[#4CC3F5] bg-gradient-to-br from-[#1597D4] to-[#18C7B5] text-white shadow-[0_0_35px_rgba(21,151,212,0.85)]"
                          : index < activeStage
                            ? "border-[#1597D4]/60 bg-[#0C3350] text-[#7FD3F2]"
                            : "border-white/15 bg-[#0A2236] text-[#5E7C93]"
                      }`}
                    >
                      {index < activeStage ? "✓" : stage.number}
                    </span>
                  </button>
                </div>
              ))}
            </div>

            <div className="pointer-events-none absolute left-[10%] right-[10%] top-1/2 h-px -translate-y-1/2 bg-white/10">
              <div
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#1597D4] to-[#18C7B5] shadow-[0_0_14px_rgba(21,151,212,0.9)] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
              <span className="tf-travel absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#7FD3F2] shadow-[0_0_10px_#7FD3F2]" />
              <span
                className="tf-travel absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#7FD3F2] shadow-[0_0_10px_#7FD3F2]"
                style={{ animationDelay: "1.2s" }}
              />
            </div>
          </div>

          {/* Stage cards */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:mt-6 lg:grid-cols-5">
            {stages.map((stage, index) => (
              <StageCard
                key={stage.number}
                stage={stage}
                index={index}
                active={activeStage === index}
                paused={paused}
                onClick={() => setActiveStage(index)}
              />
            ))}
          </div>

          {/* Active technical panel */}
          <div className="mt-10">
            <TechnicalPanel stage={activeStage} />
          </div>
        </div>

        {/* Technical stack */}
        <div className="mt-20 border-t border-white/10 pt-12">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-[#7FD3F2]">
            Current technical stack
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <StackItem label="MARKET DATA" value="Upstox API" detail="Real OHLC" />
            <StackItem label="CHART" value="Lightweight Charts" detail="Native market rendering" />
            <StackItem label="DATABASE" value="Supabase" detail="PostgreSQL + RLS" />
            <StackItem label="AI" value="Gemini / OpenAI" detail="Provider-based analysis" />
            <StackItem label="RAG" value="Not used" detail="No knowledge-base retrieval" muted />
          </div>
        </div>

        {/* Model architecture */}
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <ModelCard
            provider="GEMINI"
            model="gemini-3.5-flash-lite"
            badge="DEFAULT / FREE"
            description="EdgeCheck's default AI provider for free analysis."
            featured
          />

          <ModelCard
            provider="OPENAI"
            model="gpt-5-mini"
            badge="USER BYOK"
            description="Users can connect their own OpenAI API key and switch providers."
          />
        </div>

        {/* API key security */}
        <div className="relative mt-5 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_30px_90px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#18C7B5]/70 to-transparent" />

          <div className="grid lg:grid-cols-[1fr_1.2fr]">
            <div className="relative border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#1597D4] to-[#18C7B5] text-white shadow-[0_0_30px_rgba(21,151,212,0.6)]">
                  <span className="tf-ping absolute inset-0 rounded-xl border border-[#4CC3F5]" />
                  <ShieldIcon />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#7FD3F2]">
                    BYOK Security
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">
                    Your API key stays protected.
                  </h3>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-[#9FB8CC]">
                Users can connect their own Gemini or OpenAI API key. EdgeCheck
                encrypts the key before storing it and only decrypts it
                server-side when the selected AI provider needs it.
              </p>

              {/* ciphertext readout */}
              <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-[#041220] p-4 font-mono text-[10px] leading-5">
                <p className="text-[#6C8AA0]">
                  <span className="text-[#FF7A8A]">raw key</span> → never stored
                </p>
                <p className="mt-1 break-all text-[#18C7B5]">
                  <span className="text-[#6C8AA0]">ciphertext </span>
                  <Scramble length={32} />
                  <span className="tf-blink">▌</span>
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-7">
              <div className="grid gap-3 sm:grid-cols-2">
                <SecurityItem title="AES-256-GCM" description="API keys are encrypted before storage." />
                <SecurityItem title="Server-side only" description="Keys are never exposed to the browser." />
                <SecurityItem title="Supabase RLS" description="Database access is restricted to the authenticated owner." />
                <SecurityItem title="No plaintext storage" description="The database stores encrypted ciphertext, not the raw key." />
              </div>

              {/* pipeline */}
              <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4">
                <div className="flex flex-wrap items-center gap-y-3">
                  {["USER KEY", "ENCRYPT", "SUPABASE", "SERVER", "AI PROVIDER"].map(
                    (step, i, arr) => (
                      <div key={step} className="flex items-center">
                        <span
                          className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold ${
                            i === arr.length - 1
                              ? "bg-gradient-to-r from-[#1597D4] to-[#18C7B5] text-white shadow-[0_0_20px_rgba(21,151,212,0.6)]"
                              : "border border-[#1597D4]/30 bg-[#1597D4]/10 text-[#7FD3F2]"
                          }`}
                        >
                          {step}
                        </span>

                        {i < arr.length - 1 && (
                          <span className="relative mx-2 h-px w-6 bg-white/20 sm:w-8">
                            <span
                              className="tf-travel absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#7FD3F2] shadow-[0_0_8px_#7FD3F2]"
                              style={{ animationDelay: `${i * 0.45}s` }}
                            />
                          </span>
                        )}
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Data integrity */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-[#1597D4]/30 bg-gradient-to-br from-[#1597D4]/15 via-white/[0.04] to-[#18C7B5]/10 p-6 backdrop-blur-xl sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#1597D4]/30 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#1597D4] to-[#18C7B5] text-white shadow-[0_0_30px_rgba(21,151,212,0.55)]">
              <DataIcon />
            </div>

            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7FD3F2]">
                Data integrity
              </p>

              <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">
                AI interprets the setup. Real market data remains the source of
                truth.
              </h3>

              <p className="mt-3 max-w-3xl text-sm leading-6 text-[#9FB8CC]">
                Chart screenshots provide visual context and can be validated
                for required indicators or drawings. Exact candle and indicator
                values come from real market data and deterministic
                calculations — EdgeCheck does not ask AI to redraw or invent
                market candles.
              </p>
            </div>

            {/* live equalizer bars */}
            <div className="hidden h-16 items-end gap-1 sm:flex">
              {[0, 0.2, 0.4, 0.1, 0.5, 0.3, 0.6].map((d, i) => (
                <span
                  key={i}
                  className="tf-rise h-full w-1.5 rounded-full bg-gradient-to-t from-[#1597D4] to-[#18C7B5]"
                  style={{ animationDelay: `${d}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Final result */}
        <div className="mt-16 flex flex-col items-center">
          <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7FD3F2]">
            Example output
          </div>

          <div className="relative w-full max-w-3xl">
            <div className="absolute -inset-6 rounded-[40px] bg-[#1597D4]/25 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl p-[2px]">
              <div
                className="tf-spin-slow absolute left-1/2 top-1/2 aspect-square w-[200%] -translate-x-1/2 -translate-y-1/2"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 0 55%, #1597D4 72%, #18C7B5 86%, #9AA5FF 94%, transparent 100%)",
                }}
              />

              <div className="relative overflow-hidden rounded-[22px] bg-[#082331] p-6 sm:p-9">
                <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#1597D4]/25 blur-3xl" />
                <div className="tf-scan pointer-events-none absolute inset-x-0 h-16 bg-gradient-to-b from-transparent via-[#4CC3F5]/10 to-transparent" />

                {[
                  ["8%", "14%", "0s"],
                  ["46%", "8%", ".7s"],
                  ["90%", "50%", "1.3s"],
                  ["12%", "86%", "1.9s"],
                  ["70%", "90%", "2.3s"],
                ].map(([l, t, d], i) => (
                  <span
                    key={i}
                    className="tf-twinkle absolute h-1 w-1 rounded-full bg-white"
                    style={{ left: l, top: t, animationDelay: d }}
                  />
                ))}

                <div className="relative grid gap-8 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#75CDEB]">
                      <span className="relative flex h-2 w-2">
                        <span className="tf-ping absolute inline-flex h-full w-full rounded-full bg-[#75CDEB]" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-[#75CDEB]" />
                      </span>
                      EdgeCheck result
                    </div>

                    <h3 className="mt-3 text-2xl font-bold text-white sm:text-3xl">
                      Current market compatibility
                    </h3>

                    <p className="mt-2 max-w-md text-sm leading-6 text-[#A9C4D0]">
                      The score represents how closely the current market setup
                      satisfies the saved strategy conditions.
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <ResultTag text="Trend aligned" delay=".6s" />
                      <ResultTag text="EMA condition matched" delay=".85s" />
                      <ResultTag text="Confirmation missing" warning delay="1.1s" />
                    </div>
                  </div>

                  {/* gauge */}
                  <div className="relative mx-auto flex h-44 w-44 shrink-0 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-[#1597D4]/25 blur-2xl" />
                    <svg viewBox="0 0 160 160" className="absolute inset-0 h-full w-full -rotate-90">
                      <circle cx="80" cy="80" r="64" fill="none" stroke="#ffffff14" strokeWidth="12" />
                      <circle
                        cx="80"
                        cy="80"
                        r="64"
                        fill="none"
                        stroke="url(#tfGauge)"
                        strokeWidth="12"
                        strokeLinecap="round"
                        className="tf-ring"
                      />
                      <defs>
                        <linearGradient id="tfGauge" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#1597D4" />
                          <stop offset="60%" stopColor="#18C7B5" />
                          <stop offset="100%" stopColor="#9AA5FF" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="relative text-center">
                      <span className="text-5xl font-extrabold tracking-tight text-white">
                        <CountUp to={82} />
                        <span className="text-2xl text-[#4CC3F5]">%</span>
                      </span>
                      <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.16em] text-[#75CDEB]">
                        Strategy match
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-[11px] leading-5 text-[#7F9BB0]">
            Match score = strategy-condition compatibility.
            <br />
            It is not a probability of profit or a trading guarantee.
          </p>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function CountUp({ to, duration = 1600 }: { to: number; duration?: number }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * to));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, duration]);

  return <>{value}</>;
}

function Scramble({ length = 32 }: { length?: number }) {
  const [text, setText] = useState("0".repeat(length));

  useEffect(() => {
    const chars = "0123456789abcdef";
    const id = window.setInterval(() => {
      setText(
        Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join(""),
      );
    }, 110);

    return () => window.clearInterval(id);
  }, [length]);

  return <>{text}</>;
}

/* -------------------------------------------------------------------------- */
/* Stage Card                                                                 */
/* -------------------------------------------------------------------------- */

function StageCard({
  stage,
  index,
  active,
  paused,
  onClick,
}: {
  stage: (typeof stages)[number];
  index: number;
  active: boolean;
  paused: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl border p-4 text-left backdrop-blur transition-all duration-500 ${
        active
          ? "-translate-y-1.5 border-[#1597D4]/60 bg-white/[0.09] shadow-[0_20px_60px_rgba(21,151,212,0.3)]"
          : "border-white/10 bg-white/[0.035] hover:-translate-y-1 hover:border-white/25 hover:bg-white/[0.07]"
      }`}
    >
      {active && (
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#1597D4]/30 blur-3xl" />
      )}

      <div className="relative mb-3 flex items-center justify-between">
        <span
          className={`font-mono text-[11px] font-bold tracking-[0.18em] transition-colors ${
            active ? "text-[#7FD3F2]" : "text-[#4F6E85]"
          }`}
        >
          {stage.number}
        </span>

        <span className="relative flex h-2 w-2">
          {active && (
            <span className="tf-ping absolute inline-flex h-full w-full rounded-full bg-[#18C7B5]" />
          )}
          <span
            className={`relative inline-flex h-2 w-2 rounded-full transition-all ${
              active ? "bg-[#18C7B5] shadow-[0_0_12px_#18C7B5]" : "bg-white/15"
            }`}
          />
        </span>
      </div>

      <div className="relative mb-4">
        <MiniVisual index={index} active={active} />
      </div>

      <p
        className={`relative text-[9px] font-bold uppercase tracking-[0.16em] ${
          active ? "text-[#7FD3F2]" : "text-[#5E86A0]"
        }`}
      >
        {stage.label}
      </p>

      <h3
        className={`relative mt-2 text-sm font-bold transition-colors ${
          active ? "text-white" : "text-[#C3D6E3]"
        }`}
      >
        {stage.title}
      </h3>

      <p className="relative mt-2 text-[11px] leading-5 text-[#7F9BB0]">
        {stage.description}
      </p>

      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/5">
        {active && (
          <div
            className="tf-progress h-full bg-gradient-to-r from-[#1597D4] to-[#18C7B5] shadow-[0_0_10px_#18C7B5]"
            style={{ animationPlayState: paused ? "paused" : "running" }}
          />
        )}
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Technical Detail Panel                                                     */
/* -------------------------------------------------------------------------- */

function TechnicalPanel({ stage }: { stage: number }) {
  const panel = panels[stage];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4CC3F5]/70 to-transparent" />

      <div className="grid lg:grid-cols-[1.1fr_1fr]">
        <div className="relative overflow-hidden border-b border-white/10 p-6 sm:p-9 lg:border-b-0 lg:border-r">
          {/* ghost number */}
          <span
            key={`n-${stage}`}
            className="tf-fade-in pointer-events-none absolute -bottom-10 -right-2 select-none text-[170px] font-black leading-none tracking-tighter text-white/[0.04]"
          >
            {stages[stage].number}
          </span>

          <div key={stage} className="tf-fade-in relative">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7FD3F2]">
              {panel.eyebrow}
            </p>

            <h3 className="mt-3 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {panel.title}
            </h3>

            <p className="mt-4 max-w-xl text-sm leading-7 text-[#9FB8CC]">
              {panel.text}
            </p>
          </div>

          <div className="relative mt-8 flex items-center gap-2">
            {stages.map((s, i) => (
              <span
                key={s.number}
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  stage === i
                    ? "w-10 bg-gradient-to-r from-[#1597D4] to-[#18C7B5]"
                    : "w-4 bg-white/15"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="relative p-5 sm:p-7">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:28px_28px]" />

          <div
            key={`r-${stage}`}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#081F33]/90"
          >
            <div className="tf-scan pointer-events-none absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-[#4CC3F5]/10 to-transparent" />

            {panel.rows.map(([label, value], index) => (
              <div
                key={`${label}-${value}`}
                className={`tf-fade-in relative flex items-center justify-between gap-5 px-4 py-4 ${
                  index !== panel.rows.length - 1 ? "border-b border-white/10" : ""
                }`}
                style={{ animationDelay: `${0.1 + index * 0.12}s` }}
              >
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-[#6C8AA0]">
                  {label}
                </span>

                <span
                  className={`text-right font-mono text-[11px] font-semibold ${
                    value === "Profit probability" || value === "Not used"
                      ? "text-[#FF9AA6]"
                      : "text-[#7FD3F2]"
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mini Visuals                                                               */
/* -------------------------------------------------------------------------- */

function MiniVisual({ index, active }: { index: number; active: boolean }) {
  const shell =
    "relative h-20 overflow-hidden rounded-xl border border-white/10 bg-[#081F33]";

  if (index === 0) {
    return (
      <div className={`${shell} p-2`}>
        <div className="absolute inset-0 opacity-40">
          <Grid dark />
        </div>

        <svg viewBox="0 0 220 70" className="relative h-full w-full">
          {[22, 38, 31, 48, 41, 56, 50, 62].map((y, i) => {
            const up = i % 2 === 0;
            const color = up ? "#18C7B5" : "#FF7A8A";
            return (
              <g
                key={i}
                className={active ? "tf-grow" : ""}
                style={{ animationDelay: `${i * 80}ms`, opacity: active ? 1 : 0.5 }}
              >
                <line x1={14 + i * 25} x2={14 + i * 25} y1={y - 8} y2={y + 8} stroke={color} strokeWidth="1.5" />
                <rect x={10 + i * 25} y={y - 4} width="8" height="8" rx="1" fill={color} />
              </g>
            );
          })}
        </svg>

        {active && (
          <span className="absolute right-2 top-2 h-1.5 w-1.5 animate-pulse rounded-full bg-[#75CDEB]" />
        )}
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className={shell}>
        <svg viewBox="0 0 220 70" className="h-full w-full">
          <polyline
            pathLength={1}
            points="5,55 35,43 62,48 91,29 120,35 150,18 180,25 215,10"
            fill="none"
            stroke="#4CC3F5"
            strokeWidth="2.5"
            strokeLinejoin="round"
            className={active ? "tf-draw" : ""}
          />
          <polyline
            points="5,62 40,57 75,54 110,45 145,39 180,32 215,27"
            fill="none"
            stroke="#18C7B5"
            strokeWidth="1.5"
            className={active ? "tf-dash" : ""}
            strokeDasharray="4 4"
            opacity="0.8"
          />
          <circle cx="180" cy="25" r={active ? 4 : 3} fill="#fff" stroke="#4CC3F5" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  if (index === 2) {
    return (
      <div className={`${shell} p-2`}>
        <div className="flex h-full items-center gap-2">
          <div className="flex-1 rounded-lg bg-white/5 p-2">
            <div className="text-[7px] font-bold uppercase tracking-wider text-[#6C8AA0]">
              Natural language
            </div>
            <div className="mt-2 space-y-1">
              <div className="h-1.5 w-full rounded-full bg-white/15" />
              <div className="h-1.5 w-4/5 rounded-full bg-white/15" />
              <div className="h-1.5 w-3/5 rounded-full bg-white/15" />
            </div>
          </div>

          <div className={`text-[#4CC3F5] ${active ? "tf-twinkle" : ""}`}>→</div>

          <div className="w-24 rounded-lg border border-[#1597D4]/40 bg-[#1597D4]/10 p-2">
            <div className="text-[7px] font-bold uppercase tracking-wider text-[#7FD3F2]">
              Rules
            </div>
            <div className="mt-2 space-y-1">
              <RuleLine text="TREND" />
              <RuleLine text="EMA" />
              <RuleLine text="BREAKOUT" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (index === 3) {
    return (
      <div className={`${shell} flex items-center justify-center`}>
        <div className={`absolute h-16 w-16 rounded-full bg-[#1597D4]/30 blur-xl transition-opacity ${active ? "opacity-100" : "opacity-40"}`} />
        <div className={`absolute h-16 w-16 rounded-full border border-dashed border-[#4CC3F5]/50 ${active ? "tf-spin" : ""}`} />
        <div className={`absolute h-10 w-10 rounded-full border border-[#18C7B5]/50 border-t-transparent ${active ? "tf-spin-rev" : ""}`} />
        <div className="absolute h-5 w-5 animate-pulse rounded-full bg-[#4CC3F5] shadow-[0_0_25px_rgba(76,195,245,0.9)]" />

        <div className="absolute left-4 top-5 h-px w-12 bg-[#1597D4]/40" />
        <div className="absolute right-4 top-5 h-px w-12 bg-[#1597D4]/40" />
        <div className="absolute bottom-5 left-4 h-px w-12 bg-[#1597D4]/30" />
        <div className="absolute bottom-5 right-4 h-px w-12 bg-[#1597D4]/30" />

        <span className="absolute bottom-1 text-[7px] font-bold uppercase tracking-[0.18em] text-[#75CDEB]">
          AI reasoning
        </span>
      </div>
    );
  }

  return (
    <div className={shell}>
      <div className="absolute inset-0 opacity-40">
        <Grid dark />
      </div>

      <div className="relative flex h-full items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-extrabold tracking-tight text-white">
            82%
          </div>
          <div className="mt-0.5 text-[7px] font-bold uppercase tracking-[0.16em] text-[#75CDEB]">
            match
          </div>
          <div className="mx-auto mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-white/10">
            <div className={`h-full w-[82%] rounded-full bg-gradient-to-r from-[#1597D4] to-[#18C7B5] ${active ? "tf-bar" : ""}`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Grid({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className="h-full w-full"
      style={{
        backgroundImage: dark
          ? "linear-gradient(rgba(117,205,235,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(117,205,235,.14) 1px, transparent 1px)"
          : "linear-gradient(rgba(21,151,212,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(21,151,212,.08) 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />
  );
}

function RuleLine({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-1 w-1 rounded-full bg-[#4CC3F5]" />
      <span className="text-[7px] font-semibold text-[#B6CCDD]">{text}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Technical Stack                                                            */
/* -------------------------------------------------------------------------- */

function StackItem({
  label,
  value,
  detail,
  muted = false,
}: {
  label: string;
  value: string;
  detail: string;
  muted?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border px-4 py-4 backdrop-blur transition duration-300 hover:-translate-y-1 ${
        muted
          ? "border-dashed border-white/15 bg-white/[0.02] hover:border-white/30"
          : "border-white/10 bg-white/[0.045] hover:border-[#1597D4]/60 hover:shadow-[0_16px_40px_rgba(21,151,212,0.25)]"
      }`}
    >
      {!muted && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#4CC3F5]/70 to-transparent opacity-0 transition group-hover:opacity-100" />
      )}

      <p className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.16em] text-[#6C8AA0]">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            muted ? "bg-white/20" : "bg-[#18C7B5] shadow-[0_0_8px_#18C7B5]"
          }`}
        />
        {label}
      </p>

      <p className={`mt-2 text-sm font-bold ${muted ? "text-[#7F9BB0]" : "text-white"}`}>
        {value}
      </p>

      <p className="mt-1 text-[10px] text-[#6C8AA0]">{detail}</p>
    </div>
  );
}

function ModelCard({
  provider,
  model,
  badge,
  description,
  featured = false,
}: {
  provider: string;
  model: string;
  badge: string;
  description: string;
  featured?: boolean;
}) {
  return (
    <div
      className={`tf-shine group relative flex items-center justify-between gap-4 rounded-2xl border p-5 backdrop-blur transition duration-300 hover:-translate-y-1 ${
        featured
          ? "border-[#1597D4]/50 bg-gradient-to-br from-[#1597D4]/20 to-white/[0.04] shadow-[0_20px_50px_rgba(21,151,212,0.2)]"
          : "border-white/10 bg-white/[0.045] hover:border-white/25"
      }`}
    >
      <div className="relative min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#7FD3F2]">
            {provider}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider ${
              featured
                ? "bg-gradient-to-r from-[#1597D4] to-[#18C7B5] text-white shadow-[0_0_14px_rgba(21,151,212,0.6)]"
                : "bg-white/10 text-[#B6CCDD]"
            }`}
          >
            {badge}
          </span>
        </div>

        <p className="mt-2 font-mono text-sm font-semibold text-white">{model}</p>

        <p className="mt-1 text-[11px] text-[#9FB8CC]">{description}</p>
      </div>

      <div className="relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#7FD3F2] sm:flex">
        <span className="tf-spin-slow absolute inset-0 rounded-xl border border-dashed border-[#4CC3F5]/50" />
        <SparkIcon />
      </div>
    </div>
  );
}

function ResultTag({
  text,
  warning = false,
  delay,
}: {
  text: string;
  warning?: boolean;
  delay: string;
}) {
  return (
    <span
      className={`tf-fade-in rounded-full border px-2.5 py-1 text-[9px] font-semibold ${
        warning
          ? "border-amber-300/30 bg-amber-300/10 text-amber-200"
          : "border-[#75CDEB]/30 bg-[#75CDEB]/10 text-[#A9E5F5]"
      }`}
      style={{ animationDelay: delay }}
    >
      {text}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Security                                                                   */
/* -------------------------------------------------------------------------- */

function SecurityItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-white/10 bg-white/[0.04] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#18C7B5]/50 hover:bg-white/[0.07]">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#18C7B5]/15 text-[#18C7B5] transition group-hover:bg-[#18C7B5] group-hover:text-[#06182A]">
          <LockIcon />
        </div>

        <div>
          <p className="text-xs font-bold text-white">{title}</p>
          <p className="mt-1 text-[10px] leading-4 text-[#7F9BB0]">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

function DataIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 17h16" />
      <path d="M7 13V7" />
      <path d="M12 16V5" />
      <path d="M17 11V3" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
      <path d="M19 16l.7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 20 6v5c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10V6l8-3Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
