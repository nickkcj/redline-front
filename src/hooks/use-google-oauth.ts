"use client";

import { useCallback, useEffect, useState } from "react";

interface GoogleOAuthOptions {
  onSuccess?: (idToken: string) => void;
  onError?: (error: any) => void;
  onLoadingChange?: (loading: boolean) => void;
}

interface GoogleCredentialResponse {
  credential: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, options: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function useGoogleOAuth({
  onSuccess,
  onError,
  onLoadingChange,
}: GoogleOAuthOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id";

  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
    onLoadingChange?.(loading);
  }, [onLoadingChange]);

  const handleCredentialResponse = useCallback((response: GoogleCredentialResponse) => {
    setLoadingState(false);
    onSuccess?.(response.credential);
  }, [onSuccess, setLoadingState]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if Google script is already loaded
    if (window.google?.accounts?.id) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
        });
        setIsLoaded(true);
      }
    };

    script.onerror = () => {
      console.error("Failed to load Google Identity Services script");
      onError?.(new Error("Failed to load Google OAuth"));
    };

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [clientId, handleCredentialResponse, onError]);

  const signIn = useCallback(() => {
    if (!isLoaded || !window.google?.accounts?.id) {
      onError?.(new Error("Google OAuth not loaded"));
      return;
    }

    try {
      setLoadingState(true);

      // Create a temporary hidden button to trigger Google OAuth
      const buttonContainer = document.createElement("div");
      buttonContainer.style.position = "absolute";
      buttonContainer.style.top = "-9999px";
      buttonContainer.style.left = "-9999px";
      document.body.appendChild(buttonContainer);

      window.google.accounts.id.renderButton(buttonContainer, {
        type: "standard",
        theme: "outline",
        size: "large",
        width: 250,
      });

      // Click the hidden button to trigger OAuth
      const googleButton = buttonContainer.querySelector("div[role=button]") as HTMLElement;
      if (googleButton) {
        googleButton.click();
      } else {
        throw new Error("Google button not found");
      }

      // Clean up the temporary button
      setTimeout(() => {
        document.body.removeChild(buttonContainer);
      }, 100);
    } catch (error) {
      setLoadingState(false);
      onError?.(error);
    }
  }, [isLoaded, onError, setLoadingState]);

  return {
    signIn,
    isLoaded,
    isLoading,
  };
}