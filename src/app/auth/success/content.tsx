"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tokenStore } from "@/lib/auth/stores/auth.store";

export default function AuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const user = searchParams.get("user");

    if (token && user) {
      // Follow the same pattern as candor-front
      localStorage.setItem("access_token", token);
      localStorage.setItem("user_token", user);

      // Notify token store that tokens were updated
      tokenStore.triggerUpdate();

      // Small delay to ensure localStorage is updated before redirect
      setTimeout(() => {
        router.replace("/");
      }, 100);
    } else {
      // If something is missing, redirect to login
      router.replace("/login");
    }
  }, [router, searchParams]);

  return null;
}