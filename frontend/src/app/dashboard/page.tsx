"use client";
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { useAppDispatch } from "@/redux/hooks";
import { logoutUser, setUserError, setCurrentDate } from "@/redux/slices/userSlice";
import Header from "@/components/Header";
import DashboardCard from "./DashboardCard";
import BudgetSummary from "./BudgetSummary";
import MonthlySummary from "./MontlySummary";
import SpendingChart from "./SpendingChart";
import RecentTransactions from "./RecetTransactions";
import BudgetsOverview from "./BudgetOverview";
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
  margin-bottom: 1rem
`

const recentTransactions = [
  { date: "04/10/2024", category: "Groceries", amount: 3000 },
  { date: "04/05/2024", category: "Entertainment", amount: 1500 },
  { date: "04/05/2024", category: "Utilities", amount: 3000 },
  { date: "04/04/2024", category: "Other", amount: 1000 },
];

const budgets = [
  { category: "Groceries", budgeted: 18000, spent: 15000 },
  { category: "Entertainment", budgeted: 5000, spent: 4500 },
  { category: "Utilities", budgeted: 8500, spent: 8000 },
];

export default function DashboardPage() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showToast } = useToast();

  const spendingByCategory = {
    "month": "2025-06",
    "total_spent": 16700.0,
    "category_breakdown": {
      "entertainment": 2000.0,
      "travel": 4000.0,
      "food": 5300.0,
      "health": 1500.0,
      "groceries": 2500.0,
      "subcriptions": 1400.0
    }
  };

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
  }

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
              <SpendingChart data={spendingByCategory} />
            </DashboardCard>

            <FullWidthCard>
              <DashboardCard title="Monthly GRT Summary">
                <MonthlySummary content="An High Intesar partunit äta enjoron essentar aus." />
              </DashboardCard>
            </FullWidthCard>

            <DashboardCard title="Budgets">
              <BudgetsOverview budgets={budgets} />
            </DashboardCard>

            <DashboardCard title="Recent Transactions">
              <RecentTransactions transactions={recentTransactions} />
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
