"use client";

import { useEffect } from "react";
import styled from "styled-components";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";
import { useCompleteOAuthMutation } from "@/redux/api";

const Screen = styled.div`
  height: 100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

export default function OAuthCompletePage() {
  const router = useRouter();
  const [complete] = useCompleteOAuthMutation();

  useEffect(() => {
    const guard = window as Window & { __oauthHandoff?: string };
    const code = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("code");
    if (!code) {
      if (!guard.__oauthHandoff) router.replace("/auth/login");
      return;
    }
    if (guard.__oauthHandoff === code) return;
    guard.__oauthHandoff = code;
    window.history.replaceState(null, "", "/auth/oauth/complete");

    complete({ code })
      .unwrap()
      .then(() => router.replace("/dashboard"))
      .catch(() => router.replace("/auth/login"));
  }, [complete, router]);

  return (
    <Screen>
      <Loader size="lg" center={false} />
    </Screen>
  );
}
