"use client";

import styled from "styled-components";
import { useEffect, useLayoutEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import YearMonthDropdown from "@/components/YearMonthPicker";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import AddTransactionForm from "@/app/dashboard/AddTransactionForm";
import AddBudgetForm from "@/app/dashboard/AddBudgetForm";
import { useGetMeQuery, useLogoutMutation } from "@/redux/api";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loginUser, logoutUser, setCurrentDate, userCurrentDateSelector } from "@/redux/slices/userSlice";
import { closeSession, endSessionLocally, isSessionClosed } from "@/lib/session";

const Shell = styled.div`
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background: ${({ theme }) => theme.background};
`;

const Side = styled.aside<{ $collapsed: boolean; $motion: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? "72px" : "240px")};
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  border-right: 1px solid ${({ theme }) => theme.border};
  background: ${({ theme }) => theme.cardBg};
  transition: ${({ $motion }) => ($motion ? "width 0.2s ease" : "none")};

  @media (max-width: 768px) {
    display: none;
  }
`;

const Main = styled.div`
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const MobileNav = styled.div`
  display: none;
  flex-shrink: 0;
  @media (max-width: 768px) {
    display: block;
    border-bottom: 1px solid ${({ theme }) => theme.border};
    background: ${({ theme }) => theme.cardBg};
  }
`;

const Content = styled.main`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const PageSlot = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
`;

const Toolbar = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  flex-shrink: 0;
  margin-bottom: 1rem;
`;

const LoaderWrap = styled.div`
  height: 100vh;
  height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

type AppShellProps = {
  children: React.ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  const [showTransaction, setShowTransaction] = useState(false);
  const [showBudget, setShowBudget] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [motionReady, setMotionReady] = useState(false);
  const { data, isLoading, isError } = useGetMeQuery();
  const [logout] = useLogoutMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const currentDate = useAppSelector(userCurrentDateSelector);

  useEffect(() => {
    if (data) dispatch(loginUser(data));
    if (isError && !isSessionClosed()) router.replace("/auth/login");
  }, [data, dispatch, isError, router]);

  useLayoutEffect(() => {
    setCollapsed(window.localStorage.getItem("sidebar-collapsed") === "1");
  }, []);

  useEffect(() => {
    setMotionReady(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("sidebar-collapsed", next ? "1" : "0");
      return next;
    });
  };

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
      <Side $collapsed={collapsed} $motion={motionReady}>
        <Sidebar collapsed={collapsed} onToggleCollapse={toggleCollapsed} onLogout={handleLogout} />
      </Side>
      <Main>
        <Header
          onAddTransaction={() => setShowTransaction(true)}
          onAddBudget={() => setShowBudget(true)}
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
          <PageSlot>{children}</PageSlot>
        </Content>
      </Main>
      <Modal isOpen={showTransaction} onClose={() => setShowTransaction(false)} title="Add transaction">
        <AddTransactionForm onSuccess={() => setShowTransaction(false)} />
      </Modal>
      <Modal isOpen={showBudget} onClose={() => setShowBudget(false)} title="Add budget">
        <AddBudgetForm onSuccess={() => setShowBudget(false)} />
      </Modal>
    </Shell>
  );
}
