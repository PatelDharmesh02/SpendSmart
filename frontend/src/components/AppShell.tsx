"use client";

import styled from "styled-components";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import YearMonthDropdown from "@/components/YearMonthPicker";
import Loader from "@/components/Loader";
import { useGetMeQuery, useLogoutMutation } from "@/redux/api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser, logoutUser, setCurrentDate, userCurrentDateSelector } from "@/redux/slices/userSlice";
import { useBudgetStream } from "@/hooks/useBudgetStream";
import { closeSession, endSessionLocally, isSessionClosed } from "@/lib/session";

const Shell = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const Side = styled.aside`
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};

  @media (max-width: 768px) {
    display: none;
  }
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
`;

const MobileNav = styled.div`
  display: none;
  @media (max-width: 768px) {
    display: block;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.cardBg};
  }
`;

const Content = styled.main`
  padding: 1.5rem 2rem 3rem;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;

const LoaderWrap = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type AppShellProps = {
  children: React.ReactNode;
  onAddTransaction?: () => void;
  onAddBudget?: () => void;
};

export default function AppShell({ children, onAddTransaction, onAddBudget }: AppShellProps) {
  const { data, isLoading, isError } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentDate = useAppSelector(userCurrentDateSelector);

  useEffect(() => {
    if (data) dispatch(loginUser(data));
    if (isError && !isSessionClosed()) router.replace("/auth/login");
  }, [data, dispatch, isError, router]);

  useBudgetStream(Boolean(data));

  const handleLogout = async () => {
    if (isSessionClosed()) return;
    endSessionLocally();
    dispatch(logoutUser());
    try {
      await logout().unwrap();
    } catch {
      /* The session is already cleared locally. */
    }
    closeSession();
  };

  if (isError) return null;

  if (isLoading || !data) {
    return (
      <LoaderWrap>
        <Loader size="lg" />
      </LoaderWrap>
    );
  }

  return (
    <Shell>
      <Side>
        <Sidebar onLogout={handleLogout} />
      </Side>
      <Main>
        <Header
          onAddTransaction={onAddTransaction}
          onAddBudget={onAddBudget}
          handleLogout={handleLogout}
        />
        <MobileNav>
          <Sidebar onLogout={handleLogout} horizontal />
        </MobileNav>
        <Content>
          <Toolbar>
            <YearMonthDropdown
              value={currentDate}
              onApply={(value) => dispatch(setCurrentDate(value))}
            />
          </Toolbar>
          {children}
        </Content>
      </Main>
    </Shell>
  );
}
