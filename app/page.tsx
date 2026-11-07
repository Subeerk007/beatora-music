"use client";

import { useEffect, useState } from "react";
import BeatoraLanding from "@/components/BeatoraLanding";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="min-h-screen bg-[#070512]" />;
  }

  return <BeatoraLanding />;
}
