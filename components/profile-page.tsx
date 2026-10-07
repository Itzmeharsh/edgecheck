"use client";

import { useEffect, useState } from "react";
import PremiumModal from "@/components/premium-modal";

type ProfilePageProps = {
  name: string;
  email: string;
  plan: "free" | "premium";
};

type Provider = "gemini" | "openai";

export default function ProfilePage({
  name,
  email,
  plan,
}: ProfilePageProps) {
  const [premiumOpen, setPremiumOpen] =
    useState(false);

  const [provider, setProvider] =
    useState<Provider>("gemini");

  const [apiKey, setApiKey] =
    useState("");

  const [configuredProviders, setConfiguredProviders] =
    useState<Provider[]>([]);

  const [loadingProvider, setLoadingProvider] =
    useState(true);

  const [savingKey, setSavingKey] =
    useState(false);

  const [switchingProvider, setSwitchingProvider] =
    useState(false);

  const [providerMessage, setProviderMessage] =
    useState("");

  const initial =
    name.charAt(0).toUpperCase();

  useEffect(() => {
    async function loadProviderStatus() {
      try {
        const response = await fetch(
          "/api/profile/ai-provider",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data?.error ||
              "Failed to load AI provider."
          );
        }

        setProvider(
          data.activeProvider === "openai"
            ? "openai"
            : "gemini"
        );

        setConfiguredProviders(
          Array.isArray(
            data.configuredProviders
          )
            ? data.configuredProviders
            : []
        );
      } catch (error) {
        console.error(
          "Provider status error:",
          error
        );
      } finally {
        setLoadingProvider(false);
      }
    }

    loadProviderStatus();
  }, []);

  async function saveApiKey() {
    const trimmedKey = apiKey.trim();

    if (!trimmedKey) {
      setProviderMessage(
        "Enter an API key first."
      );
      return;
    }

    setSavingKey(true);
    setProviderMessage("");

    try {
      const response = await fetch(
        "/api/profile/ai-provider",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "save_key",
            provider,
            apiKey: trimmedKey,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to save API key."
        );
      }

      setApiKey("");

      setConfiguredProviders(
        (current) =>
          current.includes(provider)
            ? current
            : [...current, provider]
      );

      setProviderMessage(
        `${provider === "openai" ? "OpenAI" : "Gemini"} API key saved successfully.`
      );
    } catch (error) {
      console.error(
        "Save API key error:",
        error
      );

      setProviderMessage(
        error instanceof Error
          ? error.message
          : "Failed to save API key."
      );
    } finally {
      setSavingKey(false);
    }
  }

  async function changeProvider(
    nextProvider: Provider
  ) {
    setProviderMessage("");

    /*
     * Don't switch to a provider that has
     * no API key configured.
     */
    if (
      !configuredProviders.includes(
        nextProvider
      )
    ) {
      setProvider(nextProvider);

      setProviderMessage(
        `Save a ${
          nextProvider === "openai"
            ? "OpenAI"
            : "Gemini"
        } API key first.`
      );

      return;
    }

    /*
     * Already selected.
     */
    if (provider === nextProvider) {
      return;
    }

    setSwitchingProvider(true);

    try {
      const response = await fetch(
        "/api/profile/ai-provider",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "switch_provider",
            provider: nextProvider,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to switch provider."
        );
      }

      setProvider(nextProvider);

      setProviderMessage(
        `${
          nextProvider === "openai"
            ? "OpenAI"
            : "Gemini"
        } is now active.`
      );
    } catch (error) {
      console.error(
        "Switch provider error:",
        error
      );

      setProviderMessage(
        error instanceof Error
          ? error.message
          : "Failed to switch provider."
      );
    } finally {
      setSwitchingProvider(false);
    }
  }

  return (
    <>
      <div className="mx-auto w-full max-w-2xl">
        <div className="overflow-hidden rounded-3xl border border-[#dceff5] bg-white shadow-[0_20px_60px_rgba(34,135,166,0.08)]">

          {/* Header */}
          <div className="border-b border-[#eaf2f5] bg-[#f7fcfe] px-6 py-7 sm:px-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#cdebf5] text-xl font-bold text-[#237b96]">
                {initial}
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-bold text-[#12313d]">
                  Profile
                </h1>

                <p className="mt-1 text-sm text-[#78919a]">
                  Manage your EdgeCheck account.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-[#eaf2f5]">

            {/* Name */}
            <div className="px-6 py-5 sm:px-8">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9aafb6]">
                Name
              </p>

              <p className="mt-1 text-sm font-semibold text-[#173944]">
                {name}
              </p>
            </div>

            {/* Email */}
            <div className="px-6 py-5 sm:px-8">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9aafb6]">
                Email
              </p>

              <p className="mt-1 break-all text-sm font-semibold text-[#173944]">
                {email}
              </p>
            </div>

            {/* Plan */}
            <div className="px-6 py-5 sm:px-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-[#9aafb6]">
                    Current plan
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        plan === "premium"
                          ? "bg-[#e8f8f2] text-[#159a72]"
                          : "bg-[#f1f8fa] text-[#78919a]"
                      }`}
                    >
                      {plan === "premium"
                        ? "Premium"
                        : "Free"}
                    </span>

                    {plan === "premium" && (
                      <span className="text-xs font-medium text-[#159a72]">
                        ✓ Active
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setPremiumOpen(true)
                  }
                  className="rounded-xl bg-[#2da8cf] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2398be]"
                >
                  {plan === "premium"
                    ? "Manage Premium"
                    : "Upgrade Plan"}
                </button>
              </div>
            </div>

            {/* Plan benefits */}
            <div className="bg-[#fbfdfe] px-6 py-5 sm:px-8">
              <p className="text-xs font-medium uppercase tracking-wide text-[#9aafb6]">
                Plan benefits
              </p>

              {plan === "premium" ? (
                <div className="mt-3 space-y-2 text-sm text-[#48636c]">
                  <p>
                    ✓ Up to 25 saved strategies
                  </p>

                  <p>
                    ✓ 50 analyses per day
                  </p>

                  <p>
                    ✓ Advanced market analysis
                  </p>

                  <p>
                    ✓ Premium EdgeCheck features
                  </p>
                </div>
              ) : (
                <div className="mt-3 space-y-2 text-sm text-[#78919a]">
                  <p>
                    3 saved strategies
                  </p>

                  <p>
                    5 analyses per day
                  </p>

                  <p>
                    Basic strategy matching
                  </p>
                </div>
              )}
            </div>

            {/* AI Provider */}
            <div className="px-6 py-6 sm:px-8">

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#9aafb6]">
                  AI Provider
                </p>

                <p className="mt-1 text-sm text-[#78919a]">
                  Choose which AI provider EdgeCheck
                  uses for your analysis.
                </p>
              </div>

              {/* Provider toggle */}
              <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-[#dceff5] bg-[#f7fcfe] p-1.5">

                <button
                  type="button"
                  disabled={
                    loadingProvider ||
                    switchingProvider
                  }
                  onClick={() =>
                    changeProvider("gemini")
                  }
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    provider === "gemini"
                      ? "bg-white text-[#173944] shadow-sm"
                      : "text-[#78919a] hover:text-[#48636c]"
                  }`}
                >
                  Gemini
                </button>

                <button
                  type="button"
                  disabled={
                    loadingProvider ||
                    switchingProvider
                  }
                  onClick={() =>
                    changeProvider("openai")
                  }
                  className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    provider === "openai"
                      ? "bg-white text-[#173944] shadow-sm"
                      : "text-[#78919a] hover:text-[#48636c]"
                  }`}
                >
                  OpenAI
                </button>

              </div>

              {/* Current provider */}
              <div className="mt-4 rounded-2xl border border-[#eaf2f5] bg-[#fbfdfe] px-4 py-3">

                <div className="flex items-center justify-between gap-3">

                  <div>
                    <p className="text-xs text-[#9aafb6]">
                      Selected provider
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#173944]">
                      {provider === "openai"
                        ? "OpenAI"
                        : "Gemini"}
                    </p>
                  </div>

                  {configuredProviders.includes(
                    provider
                  ) && (
                    <span className="rounded-full bg-[#e8f8f2] px-3 py-1 text-xs font-semibold text-[#159a72]">
                      ✓ Key configured
                    </span>
                  )}

                </div>
              </div>

              {/* API key input */}
              <div className="mt-5">

                <label
                  htmlFor="ai-api-key"
                  className="text-sm font-semibold text-[#173944]"
                >
                  {provider === "openai"
                    ? "OpenAI API Key"
                    : "Gemini API Key"}
                </label>

                <p className="mt-1 text-xs text-[#8aa0a8]">
                  Your key is encrypted before it
                  is stored.
                </p>

                <input
                  id="ai-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(event) =>
                    setApiKey(event.target.value)
                  }
                  placeholder={
                    provider === "openai"
                      ? "Enter your OpenAI API key"
                      : "Enter your Gemini API key"
                  }
                  autoComplete="off"
                  className="mt-3 w-full rounded-xl border border-[#dceff5] bg-white px-4 py-3 text-sm text-[#173944] outline-none transition placeholder:text-[#a7b8be] focus:border-[#2da8cf] focus:ring-4 focus:ring-[#2da8cf]/10"
                />

                <button
                  type="button"
                  disabled={savingKey}
                  onClick={saveApiKey}
                  className="mt-3 rounded-xl bg-[#173944] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#214d5c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingKey
                    ? "Saving..."
                    : `Save ${
                        provider === "openai"
                          ? "OpenAI"
                          : "Gemini"
                      } Key`}
                </button>

                {providerMessage && (
                  <p className="mt-3 text-sm font-medium text-[#237b96]">
                    {providerMessage}
                  </p>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium modal */}
      <PremiumModal
        open={premiumOpen}
        onClose={() =>
          setPremiumOpen(false)
        }
      />
    </>
  );
}