"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/redux/hooks";
import {
  logoutUser,
  setUserError,
  setCurrentDate,
} from "@/redux/slices/userSlice";
import Header from "@/components/Header";
import DashboardCard from "./DashboardCard";
import BudgetSummary from "./BudgetSummary";
import MonthlySummary from "./MontlySummary";
import SpendingChart from "./SpendingChart";
import Transactions from "./Transactions";
import BudgetsOverview from "./Budgets";
import Modal from "@/components/Modal";
import AddTransactionForm from "./AddTransactionForm";
import AddBudgetForm from "./AddBudgetForm";
import { useRouter } from "next/navigation";
import { useToast } from "@/lib/ToasteContext";
import { checkAuth } from "@/redux/thunk";
import { AppError, handleErrorWithoutHook } from "@/utils/errorHandler";
import YearMonthDropdown from "@/components/YearMonthPicker";
import { DateFormat } from "@/types/user.type";

const DashboardContainer = styled.div`
  height: 100vh;
  background: ${({ theme }) => theme.background};
`;

const MainContent = styled.div`
  width: 100%;
  height: 100%;
  flex-direction: column;
`;

const PageContent = styled.div`
  padding: 2rem;
  background: ${({ theme }) => theme.background};
`;

const CardsGrid = styled.div`
  display: grid;
  gap: 1rem;

  grid-template-columns: 1fr;

  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  & > * {
    min-width: 0;
  }
`;

const FullWidthCard = styled.div`
  grid-column: 1 / -1;
`;

const DateContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
`;


export default function DashboardPage() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await dispatch(checkAuth()).unwrap();
      } catch (error: unknown) {
        dispatch(setUserError(`Failed to fetch user data`));
        handleErrorWithoutHook(error as AppError, showToast, {
          prefix: "Token expired or invalid. Please login again",
          fallbackMessage: "Failed to fetch user data. Please try again.",
        });
        router.push("/auth/login");
      }
    };
    checkAuthStatus();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    showToast("Logout successful!", "success");
    dispatch(logoutUser());
    router.push("/auth/login");
  };

  const handleAddBudget = () => {
    setShowBudgetModal(!showBudgetModal);
  };

  const handleAddTransaction = () => {
    setShowTransactionModal(!showTransactionModal);
  };

  const handleMonthchange = (value: DateFormat) => {
    dispatch(setCurrentDate(value));
  };

  return (
    <DashboardContainer>
      <MainContent>
        <Header
          onAddTransaction={handleAddTransaction}
          onAddBudget={handleAddBudget}
          handleLogout={handleLogout}
        />
        <PageContent>
          <DateContainer>
            <YearMonthDropdown onApply={handleMonthchange} />
          </DateContainer>
          <CardsGrid>
            <DashboardCard title="Budgeted vs Spent">
              <BudgetSummary />
            </DashboardCard>

            <DashboardCard title="Spending by Category">
              <SpendingChart />
            </DashboardCard>

            <FullWidthCard>
              <DashboardCard title="Monthly AI Summary">
                <MonthlySummary />
              </DashboardCard>
            </FullWidthCard>

            <DashboardCard title="Budgets" height="30rem">
              <BudgetsOverview />
            </DashboardCard>

            <DashboardCard title="Transactions" height="30rem">
              <Transactions />
            </DashboardCard>
          </CardsGrid>
        </PageContent>
      </MainContent>

      <Modal
        isOpen={showTransactionModal}
        onClose={() => setShowTransactionModal(false)}
        title="Add New Transaction"
      >
        <AddTransactionForm onSuccess={handleAddTransaction} />
      </Modal>

      <Modal
        isOpen={showBudgetModal}
        onClose={() => setShowBudgetModal(false)}
        title="Create New Budget"
      >
        <AddBudgetForm onSuccess={handleAddBudget} />
      </Modal>
    </DashboardContainer>
  );
}
