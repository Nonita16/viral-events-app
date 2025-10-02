import React from "react";
import { AuthButton } from "./auth-button";
import Link from "next/link";

export default function Header() {
  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-pink-200/30 sticky top-0 z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                href={"/"}
                className="text-2xl font-black bg-gradient-to-r from-pink-600 to-yellow-600 bg-clip-text text-transparent hover:from-pink-700 hover:to-yellow-700 transition-all duration-200"
              >
                My Viral Event ✨
              </Link>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              <Link
                href={"/"}
                className="inline-flex items-center px-4 py-2 mx-1 rounded-full text-sm font-semibold transition-all duration-200 bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg transform scale-105"
              >
                Home
              </Link>
            </div>
          </div>
          <div className="hidden sm:flex sm:items-center">
            <AuthButton />
          </div>
          <div className="sm:hidden flex items-center">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
}
