// @/app/auth/goodbye/page.tsx
"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RocketIcon } from "lucide-react";
import { useUserStore } from "@/stores/useUSerStore";

// Composant qui utilise useSearchParams
function GoodbyeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason");

  const { reset: resetUser } = useUserStore();

  useEffect(() => {
    resetUser();
    // resetProjectStore();
  }, [resetUser]);

  const getMessage = () => {
    switch (reason) {
      case "session_expired":
        return "Your session has expired for security reasons";
      case "inactivity":
        return "Automatic disconnection after inactivity";
      default:
        return "You have been successfully disconnected";
    }
  };

  const handleReconnect = () => {
    router.push("/auth/sign-in");
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center">
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center space-y-6">
        <div className="animate-bounce">
          <RocketIcon className="w-16 h-16 mx-auto text-indigo-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-800">Goodbye!</h1>

        <p className="text-gray-600">{getMessage()}. Come back anytime!</p>

        <div className="pt-6 space-y-4">
          <Button
            size="lg"
            className="w-full bg-indigo-600 hover:bg-indigo-700"
            onClick={handleReconnect}
          >
            Sign In Again
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full border-indigo-300 text-indigo-600 hover:bg-indigo-50"
            onClick={handleGoHome}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

// Composant de fallback pendant le chargement
function GoodbyeFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center">
      <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-lg text-center space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="w-16 h-16 mx-auto bg-indigo-200 rounded-full"></div>
          <div className="h-8 bg-gray-200 rounded mx-auto w-32"></div>
          <div className="h-4 bg-gray-200 rounded mx-auto w-48"></div>
          <div className="space-y-4 pt-6">
            <div className="h-12 bg-gray-200 rounded w-full"></div>
            <div className="h-12 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page principale avec Suspense
export default function GoodbyePage() {
  return (
    <Suspense fallback={<GoodbyeFallback />}>
      <GoodbyeContent />
    </Suspense>
  );
}
