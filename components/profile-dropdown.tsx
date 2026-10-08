"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileDropdownProps = {
  name: string;
  email: string;
};

export default function ProfileDropdown({
  name,
  email,
}: ProfileDropdownProps) {
  const router = useRouter();
  const supabase = createClient();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // -----------------------------------------------------
  // Close when clicking outside
  // -----------------------------------------------------

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener(
        "mousedown",
        handleClickOutside
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [open]);

  // -----------------------------------------------------
  // Logout
  // -----------------------------------------------------

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      setLoggingOut(false);
      return;
    }

    router.push("/login");
    router.refresh();
  }

  return (
    <div
      ref={dropdownRef}
      className="relative"
    >
      {/* Profile button */}
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Open profile menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#cdebf5] text-sm font-bold text-[#237b96] transition hover:bg-[#bce4f0] focus:outline-none focus:ring-4 focus:ring-[#54b9d8]/15"
      >
        {name.charAt(0).toUpperCase()}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-[#dceff5] bg-white shadow-[0_15px_50px_rgba(34,135,166,0.16)]">

          {/* User information */}
          <div className="border-b border-[#eaf2f5] px-4 py-3">
            <p className="truncate text-sm font-semibold text-[#173944]">
              {name}
            </p>

            <p className="mt-0.5 truncate text-xs text-[#8aa0a8]">
              {email}
            </p>
          </div>

          {/* Menu */}
          <div className="p-2">

            {/* Profile */}
            <Link
              href="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#48636c] transition hover:bg-[#f1f8fa] hover:text-[#173944]"
            >
              <User
                size={17}
                className="text-[#78919a]"
              />

              <span>Profile</span>
            </Link>

            {/* Privacy Policy */}
           <Link
  href="/privacy"
  onClick={() => setOpen(false)}
  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#48636c] transition hover:bg-[#f1f8fa] hover:text-[#173944]"
>
              <Shield
                size={17}
                className="text-[#78919a]"
              />

              <span>Privacy Policy</span>
            </Link>

            {/* Divider */}
            <div className="my-1 border-t border-[#eaf2f5]" />

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LogOut size={17} />

              <span>
                {loggingOut ? "Logging out..." : "Log out"}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}