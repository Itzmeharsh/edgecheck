"use client";

import { useState } from "react";
import { X, Check, CreditCard, KeyRound, Loader2 } from "lucide-react";

type PremiumModalProps = {
  open: boolean;
  onClose: () => void;
};

type Mode = "purchase" | "api";
type Provider = "gemini" | "openai";

export default function PremiumModal({
  open,
  onClose,
}: PremiumModalProps) {
  const [mode, setMode] = useState<Mode>("purchase");
  const [provider, setProvider] =
    useState<Provider>("gemini");
  const [apiKey, setApiKey] = useState("");
  const [validating, setValidating] = useState(false);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  if (!open) {
    return null;
  }

  function changeProvider(nextProvider: Provider) {
    setProvider(nextProvider);
    setApiKey("");
    setApiError("");
    setApiSuccess("");
  }

  async function validateApiKey() {
    setApiError("");
    setApiSuccess("");

    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      setApiError("Please enter your API key.");
      return;
    }

    setValidating(true);

    try {
      const response = await fetch(
        "/api/settings/validate-api-key",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            provider,
            apiKey: trimmedKey,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setApiError(
          data.error ||
            "Unable to validate this API key."
        );
        return;
      }

      setApiSuccess(
        provider === "gemini"
          ? "Gemini API key verified successfully."
          : "OpenAI API key verified successfully."
      );
    } catch (error) {
      console.error(error);

      setApiError(
        "Unable to verify the API key right now. Please try again."
      );
    } finally {
      setValidating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#12313d]/30 px-4 py-6 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#dceff5] bg-white shadow-[0_25px_80px_rgba(34,135,166,0.20)]">

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-[#78919a] transition hover:bg-[#f1f8fa] hover:text-[#173944]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="px-6 pb-5 pt-7 text-center sm:px-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e0f5fb] text-[#249bc2]">
            {mode === "purchase" ? (
              <CreditCard size={22} />
            ) : (
              <KeyRound size={22} />
            )}
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-[#12313d]">
            Get EdgeCheck Premium
          </h2>

          <p className="mt-2 text-sm text-[#718991]">
            Unlock more strategies and deeper market analysis.
          </p>
        </div>

        {/* Mode switch */}
        <div className="mx-6 rounded-xl bg-[#f1f8fa] p-1 sm:mx-8">
          <div className="grid grid-cols-2 gap-1">
            <button
              type="button"
              onClick={() => {
                setMode("purchase");
                setApiError("");
                setApiSuccess("");
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                mode === "purchase"
                  ? "bg-white text-[#173944] shadow-sm"
                  : "text-[#78919a] hover:text-[#294b57]"
              }`}
            >
              Purchase
            </button>

            <button
              type="button"
              onClick={() => {
                setMode("api");
                setApiError("");
                setApiSuccess("");
              }}
              className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                mode === "api"
                  ? "bg-white text-[#173944] shadow-sm"
                  : "text-[#78919a] hover:text-[#294b57]"
              }`}
            >
              Use API Key
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-7 pt-6 sm:px-8">
          {mode === "purchase" ? (
            <>
              {/* Price */}
              <div className="mb-6 rounded-2xl border border-[#dceff5] bg-[#f7fcfe] p-5 text-center">
                <p className="text-sm font-medium text-[#78919a]">
                  Premium plan
                </p>

                <div className="mt-1">
                  <span className="text-4xl font-bold tracking-tight text-[#12313d]">
                    ₹149
                  </span>

                  <span className="ml-1 text-sm text-[#78919a]">
                    /month
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                <Feature text="25 saved strategies" />
                <Feature text="50 analyses per day" />
                <Feature text="Advanced market analysis" />
                <Feature text="Premium features" />
              </div>

              {/* Purchase */}
              <button
                type="button"
                onClick={() => {
                  // Stripe Checkout will be connected next.
                }}
                className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2da8cf] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2398be]"
              >
                Continue to Stripe
                <span aria-hidden="true">→</span>
              </button>
            </>
          ) : (
            <>
              {/* Provider */}
              <div>
                <label
                  htmlFor="provider"
                  className="mb-1.5 block text-sm font-medium text-[#294b57]"
                >
                  AI provider
                </label>

                <select
                  id="provider"
                  value={provider}
                  onChange={(e) =>
                    changeProvider(
                      e.target.value as Provider
                    )
                  }
                  className="w-full rounded-xl border border-[#d7e9ee] bg-white px-4 py-3 text-sm text-[#173944] outline-none transition focus:border-[#54b9d8] focus:ring-4 focus:ring-[#54b9d8]/10"
                >
                  <option value="gemini">
                    Google Gemini
                  </option>

                  <option value="openai">
                    OpenAI
                  </option>
                </select>
              </div>

              {/* API key */}
              <div className="mt-4">
                <label
                  htmlFor="api-key"
                  className="mb-1.5 block text-sm font-medium text-[#294b57]"
                >
                  API Key
                </label>

                <input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setApiError("");
                    setApiSuccess("");
                  }}
                  placeholder={
                    provider === "gemini"
                      ? "Enter your Gemini API key"
                      : "Enter your OpenAI API key"
                  }
                  autoComplete="off"
                  className="w-full rounded-xl border border-[#d7e9ee] bg-white px-4 py-3 text-sm text-[#173944] outline-none transition placeholder:text-[#9bb0b8] focus:border-[#54b9d8] focus:ring-4 focus:ring-[#54b9d8]/10"
                />
              </div>

              {/* Error */}
              {apiError && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-600">
                  {apiError}
                </div>
              )}

              {/* Success */}
              {apiSuccess && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-5 text-emerald-700">
                  <Check
                    size={17}
                    className="mt-0.5 shrink-0"
                  />

                  <span>{apiSuccess}</span>
                </div>
              )}

              {/* Security notice */}
              {!apiSuccess && (
                <div className="mt-4 rounded-xl border border-[#dceff5] bg-[#f7fcfe] px-4 py-3 text-xs leading-5 text-[#78919a]">
                  Your API key is sent directly to EdgeCheck's
                  secure server for verification. It is not exposed
                  to other users.
                </div>
              )}

              {/* Validate */}
              <button
                type="button"
                onClick={validateApiKey}
                disabled={validating}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#2da8cf] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2398be] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {validating ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Verifying...
                  </>
                ) : apiSuccess ? (
                  "API Key Verified"
                ) : (
                  "Verify API Key"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#dff5eb] text-[#16865c]">
        <Check size={13} strokeWidth={2.5} />
      </div>

      <span className="text-sm text-[#48636c]">
        {text}
      </span>
    </div>
  );
}