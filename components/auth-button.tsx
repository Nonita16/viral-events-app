import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { GradientButton } from "./gradient-button";

export async function AuthButton() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getClaims();

  const user = data?.claims;

  return user ? (
    <div className="flex items-center gap-4">
      Hey, {user.email}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center space-x-3">
      <Link
        href="/auth/login"
        className="text-sm font-medium text-gray-700 hover:text-black transition-colors duration-200"
      >
        Sign In
      </Link>
      <GradientButton href="/auth/sign-up">Get Started</GradientButton>
    </div>
  );
}
