"use client";

import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface UserAvatarMenuProps {
  email: string;
}

export function UserAvatarMenu({ email }: UserAvatarMenuProps) {
  const router = useRouter();
  const firstLetter = email.charAt(0).toUpperCase();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <Popover className="relative">
      <PopoverButton className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold text-sm hover:bg-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2">
        {firstLetter}
      </PopoverButton>

      <PopoverPanel className="absolute right-0 z-10 mt-2 w-48 origin-top-right">
        <div className="rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs text-gray-500">Signed in as</p>
            <p className="text-sm font-medium text-gray-900 truncate">{email}</p>
          </div>
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-pink-50 hover:to-yellow-50 transition-colors duration-150"
            >
              Sign out
            </button>
          </div>
        </div>
      </PopoverPanel>
    </Popover>
  );
}
