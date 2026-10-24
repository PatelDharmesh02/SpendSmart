"use client";

import styled from "styled-components";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/Button";
import { useGetMeQuery, useLogoutMutation } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser } from "@/redux/slices/userSlice";
import { closeSession, endSessionLocally, isSessionClosed } from "@/lib/session";

const Panel = styled.section`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 1.5rem;
  max-width: 640px;
  color: ${({ theme }) => theme.textPrimary};
`;

const Row = styled.p`
  margin: 0.4rem 0;
`;

export default function SettingsPage() {
  const { data } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();

  return (
    <AppShell>
      <Panel>
        <h2>Account</h2>
        <Row>Name: {data?.name}</Row>
        <Row>Email: {data?.email}</Row>
        <Row>Sign-in method: {data?.auth_provider || "password"}</Row>
        <Row>Connected provider id: {data?.provider_id || "Not linked"}</Row>
        <Button
          type="button"
          $variant="primary"
          onClick={async () => {
            if (isSessionClosed()) return;
            endSessionLocally();
            dispatch(logoutUser());
            try {
              await logout().unwrap();
            } catch {
              /* The session is already cleared locally. */
            }
            closeSession();
          }}
        >
          Log out
        </Button>
      </Panel>
    </AppShell>
  );
}
