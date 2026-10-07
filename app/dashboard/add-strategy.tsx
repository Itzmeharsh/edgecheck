"use client";

import { useState } from "react";
import { X } from "lucide-react";

export default function AddStrategy() {
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [strategyText, setStrategyText] = useState("");

  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  const showSnackbar = (
    type: "error" | "success",
    message: string
  ) => {
    setSnackbar({
      type,
      message,
    });

    setTimeout(() => {
      setSnackbar(null);
    }, 4000);
  };

  const handleCreateStrategy = async () => {
    if (!name.trim()) {
      showSnackbar(
        "error",
        "Please enter a strategy name."
      );
      return;
    }

    if (!strategyText.trim()) {
      showSnackbar(
        "error",
        "Please describe your strategy."
      );
      return;
    }

    try {
      setLoading(true);
      setSnackbar(null);

      const response = await fetch("/api/strategies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          strategyText: strategyText.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (
  data.code ===
  "INSUFFICIENT_INFORMATION"
) {
  // Clear the irrelevant input
  setName("");
  setStrategyText("");

  showSnackbar(
    "error",
    "Not enough information. Please provide a brief description of your strategy."
  );

  return;
}

        if (
          data.code ===
          "STRATEGY_LIMIT_REACHED"
        ) {
          showSnackbar(
            "error",
            data.error ||
              "You have reached your strategy limit."
          );

          return;
        }

        showSnackbar(
          "error",
          data.error ||
            "Unable to create strategy."
        );

        return;
      }

      showSnackbar(
        "success",
        "Strategy created successfully."
      );

      setName("");
      setStrategyText("");

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      console.error(error);

      showSnackbar(
        "error",
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Add Strategy Button */}
      <button
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[#2fa8cf] px-5 py-3 font-semibold text-white transition hover:bg-[#279abd]"
      >
        Add Strategy
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-2xl sm:p-8">

            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-gray-500 transition hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="mb-7">
              <h2 className="text-2xl font-bold text-slate-800">
                Add Strategy
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Describe your trading strategy naturally.
                EdgeCheck will structure it for analysis.
              </p>
            </div>

            {/* Strategy Name */}
            <div className="mb-5">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Strategy name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                placeholder="e.g. EMA Breakout Strategy"
                maxLength={100}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2fa8cf] focus:ring-2 focus:ring-[#2fa8cf]/10"
              />
            </div>

            {/* Strategy Description */}
            <div className="mb-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Describe your strategy
              </label>

              <textarea
                value={strategyText}
                onChange={(e) =>
                  setStrategyText(e.target.value)
                }
                placeholder="For example: Mark the trendline. If it breaks, wait for confirmation and a pullback to the trendline, then identify the levels to enter and exit."
                maxLength={5000}
                rows={9}
                className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#2fa8cf] focus:ring-2 focus:ring-[#2fa8cf]/10"
              />
            </div>

            <div className="mb-6 flex items-center justify-between text-sm text-slate-400">
              <span>
                Write it the way you normally explain a strategy.
              </span>

              <span>
                {strategyText.length}/5000
              </span>
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleCreateStrategy}
                disabled={loading}
                className="rounded-xl bg-[#2fa8cf] px-5 py-3.5 font-semibold text-white transition hover:bg-[#279abd] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Analyzing strategy..."
                  : "Create strategy"}
              </button>

              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="rounded-xl border border-slate-200 px-5 py-3.5 font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar */}
      {snackbar && (
        <div
          className={`fixed bottom-6 left-1/2 z-[100] w-[calc(100%-32px)] max-w-md -translate-x-1/2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl ${
            snackbar.type === "error"
              ? "border border-red-200 bg-red-50 text-red-700"
              : "border border-emerald-200 bg-emerald-50 text-emerald-700"
          }`}
        >
          {snackbar.message}
        </div>
      )}
    </>
  );
}