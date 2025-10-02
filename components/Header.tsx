import React from "react";
import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "./HeaderClient";

export default async function Header() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  // Only treat as authenticated user if they have an email and are not anonymous
  const user = authUser?.email && !authUser?.is_anonymous
    ? { email: authUser.email }
    : null;

  return <HeaderClient user={user} />;
}
