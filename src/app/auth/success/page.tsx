"use client";

import { Suspense } from "react";
import AuthSuccessContent from "./content";

export default function AuthSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSuccessContent />
    </Suspense>
  );
}