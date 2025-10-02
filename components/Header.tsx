import React from "react";
import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "./HeaderClient";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ? { email: data.claims.email as string } : null;

  return <HeaderClient user={user} />;
}
