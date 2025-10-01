"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const ICON_SIZE = 16;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50 h-9 px-3"
      >
        {theme === "light" ? (
          <Sun key="light" size={ICON_SIZE} className="text-gray-600 dark:text-gray-400" />
        ) : theme === "dark" ? (
          <Moon key="dark" size={ICON_SIZE} className="text-gray-600 dark:text-gray-400" />
        ) : (
          <Laptop key="system" size={ICON_SIZE} className="text-gray-600 dark:text-gray-400" />
        )}
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 top-full mt-2 z-50 min-w-[8rem] overflow-hidden rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-1 text-gray-950 dark:text-gray-50 shadow-md">
            <button
              onClick={() => {
                setTheme("light");
                setIsOpen(false);
              }}
              className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <Sun size={ICON_SIZE} className="text-gray-600 dark:text-gray-400" />
              <span>Light</span>
              {theme === "light" && (
                <span className="ml-auto h-2 w-2 rounded-full bg-gray-900 dark:bg-gray-50" />
              )}
            </button>
            <button
              onClick={() => {
                setTheme("dark");
                setIsOpen(false);
              }}
              className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <Moon size={ICON_SIZE} className="text-gray-600 dark:text-gray-400" />
              <span>Dark</span>
              {theme === "dark" && (
                <span className="ml-auto h-2 w-2 rounded-full bg-gray-900 dark:bg-gray-50" />
              )}
            </button>
            <button
              onClick={() => {
                setTheme("system");
                setIsOpen(false);
              }}
              className="relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 focus:bg-gray-100 dark:focus:bg-gray-800"
            >
              <Laptop size={ICON_SIZE} className="text-gray-600 dark:text-gray-400" />
              <span>System</span>
              {theme === "system" && (
                <span className="ml-auto h-2 w-2 rounded-full bg-gray-900 dark:bg-gray-50" />
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export { ThemeSwitcher };
