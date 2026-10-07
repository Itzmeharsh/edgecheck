"use client";

import { useState } from "react";
import PremiumModal from "@/components/premium-modal";

type PremiumButtonProps = {
  plan: "free" | "premium";
};

export default function PremiumButton({
  plan,
}: PremiumButtonProps) {
  const [open, setOpen] = useState(false);

  // Premium users don't need the upgrade button.
  if (plan === "premium") {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-xl bg-[#2da8cf] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2398be]"
      >
        Get Premium
      </button>

      <PremiumModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}