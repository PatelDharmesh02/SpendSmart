"use client";

import { useState } from "react";
import styled from "styled-components";
import AppShell from "@/components/AppShell";
import DashboardCard from "./DashboardCard";
import BudgetSummary from "./BudgetSummary";
import SpendingChart from "./SpendingChart";
import Modal from "@/components/Modal";
import AddTransactionForm from "./AddTransactionForm";
import AddBudgetForm from "./AddBudgetForm";
import Loader from "@/components/Loader";
import { useGetDashboardQuery } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { userAuthenticatedSelector, userCurrentDateSelector } from "@/redux/slices/userSlice";
import { formatMoney, monthKey } from "@/lib/finance";

const Grid = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(4, 1fr);

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Cards = styled.div`
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
  grid-template-columns: 1fr 1fr;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Stat = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 1rem 1.25rem;
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.85rem;
`;

const StatValue = styled.div`
  margin-top: 0.35rem;
  font-size: 1.45rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textPrimary};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.6rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8rem;
`;

const Td = styled.td`
  padding: 0.6rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textPrimary};
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.textSecondary};
`;

export default function DashboardPage() {
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const currentDate = useAppSelector(userCurrentDateSelector);
  const authed = useAppSelector(userAuthenticatedSelector);
  const month = monthKey(currentDate);
  const { data, isLoading, isError } = useGetDashboardQuery(month, { skip: !authed });

  return (
    <AppShell
      onAddTransaction={() => setShowTransactionModal(true)}
      onAddBudget={() => setShowBudgetModal(true)}
    >
      {isLoading && <Loader size="md" />}
      {isError && <Empty>Could not load this month.</Empty>}
      {data && (
        <>
          <Grid>
            <Stat>
              <StatLabel>Income</StatLabel>
              <StatValue>{formatMoney(data.income)}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Expenses</StatLabel>
              <StatValue>{formatMoney(data.expenses)}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Net</StatLabel>
              <StatValue>{formatMoney(data.net)}</StatValue>
            </Stat>
            <Stat>
              <StatLabel>Savings rate</StatLabel>
              <StatValue>{data.savings_rate}%</StatValue>
            </Stat>
          </Grid>
          <Cards>
            <DashboardCard title="Budget vs actual">
              <BudgetSummary rows={data.budget_vs_actual} />
            </DashboardCard>
            <DashboardCard title="Spending by category">
              <SpendingChart breakdown={data.category_breakdown} total={data.expenses} />
            </DashboardCard>
          </Cards>
          <Cards>
            <DashboardCard title="Recent transactions" height="auto">
              {data.transactions.length === 0 ? (
                <Empty>Add a transaction to see it here.</Empty>
              ) : (
                <Table>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Description</Th>
                      <Th>Category</Th>
                      <Th>Amount</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.transactions.slice(0, 6).map((tx) => (
                      <tr key={tx.id}>
                        <Td>{tx.date}</Td>
                        <Td>{tx.desc || tx.merchant || "—"}</Td>
                        <Td>
                          {tx.category}
                          {tx.category_source === "ai" ? " · AI" : ""}
                        </Td>
                        <Td>{formatMoney(tx.amount)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </DashboardCard>
            <DashboardCard title="Budget health" height="auto">
              <StatValue>{data.budget_health}%</StatValue>
              <Empty>Share of categories still within budget. Updates live when spending changes.</Empty>
            </DashboardCard>
          </Cards>
        </>
      )}
      <Modal isOpen={showTransactionModal} onClose={() => setShowTransactionModal(false)} title="Add transaction">
        <AddTransactionForm onSuccess={() => setShowTransactionModal(false)} />
      </Modal>
      <Modal isOpen={showBudgetModal} onClose={() => setShowBudgetModal(false)} title="Add budget">
        <AddBudgetForm onSuccess={() => setShowBudgetModal(false)} />
      </Modal>
    </AppShell>
  );
}
