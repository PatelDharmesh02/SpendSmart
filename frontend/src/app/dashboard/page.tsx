"use client";

import { useState } from "react";
import styled from "styled-components";
import DashboardCard from "./DashboardCard";
import BudgetSummary from "./BudgetSummary";
import SpendingChart from "./SpendingChart";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useGetDashboardQuery, useSetMonthlyIncomeMutation } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { userAuthenticatedSelector, userCurrentDateSelector } from "@/redux/slices/userSlice";
import { errorMessage, formatMoney, monthKey } from "@/lib/finance";
import { useToast } from "@/lib/ToasteContext";

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

const StatNote = styled.div`
  margin-top: 0.35rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.85rem;
`;

const FieldLabel = styled.label`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const IncomeAction = styled.button`
  margin-top: 0.65rem;
  padding: 0;
  border: none;
  background: none;
  color: ${({ theme }) => theme.primary};
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
`;

const IncomeForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const TableScroll = styled.div`
  max-height: 280px;
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  min-width: 520px;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  text-align: left;
  padding: 0.6rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8rem;
  background: ${({ theme }) => theme.cardBg};
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
  const currentDate = useAppSelector(userCurrentDateSelector);
  const authed = useAppSelector(userAuthenticatedSelector);
  const month = monthKey(currentDate);
  const { data, isLoading, isError } = useGetDashboardQuery(month, { skip: !authed });
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");
  const [incomeDescription, setIncomeDescription] = useState("");
  const [setIncome, { isLoading: savingIncome }] = useSetMonthlyIncomeMutation();
  const { showToast } = useToast();

  const openIncome = () => {
    setIncomeAmount(data?.income ? String(data.income) : "");
    setIncomeDescription(data?.income_description || "");
    setIncomeOpen(true);
  };

  return (
    <>
      {isLoading && <Loader size="md" center />}
      {isError && <Empty>Could not load this month.</Empty>}
      {data && (
        <>
          <Grid>
            <Stat>
              <StatLabel>Income</StatLabel>
              <StatValue>{formatMoney(data.income)}</StatValue>
              {data.income_description && <StatNote>{data.income_description}</StatNote>}
              <IncomeAction type="button" onClick={openIncome}>
                {data.monthly_income == null ? "Set income" : "Update income"}
              </IncomeAction>
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
            <DashboardCard title="Budget vs Actual">
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
                <TableScroll>
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
                    {data.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <Td>{tx.date}</Td>
                        <Td>{tx.desc || tx.merchant || "—"}</Td>
                        <Td>{tx.status === "pending" || tx.category === "pending" ? "miscellaneous" : tx.category}</Td>
                        <Td>{formatMoney(tx.amount)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                </TableScroll>
              )}
            </DashboardCard>
            <DashboardCard title="Budget health" height="auto">
              <StatValue>{data.budget_health}%</StatValue>
              <Empty>Share of categories still within budget. Updates live when spending changes.</Empty>
            </DashboardCard>
          </Cards>
        </>
      )}
      <Modal
        isOpen={incomeOpen}
        onClose={() => setIncomeOpen(false)}
        title={data?.monthly_income == null ? "Set income" : "Update income"}
      >
        <IncomeForm
          onSubmit={async (event) => {
            event.preventDefault();
            const amount = Number(incomeAmount);
            if (Number.isNaN(amount) || amount < 0) {
              showToast("Enter an income of zero or more.", "error");
              return;
            }
            try {
              await setIncome({ month, amount, description: incomeDescription }).unwrap();
              showToast("Income saved", "success");
              setIncomeOpen(false);
            } catch (error) {
              showToast(errorMessage(error, "Could not save income"), "error");
            }
          }}
        >
          <Field>
            <FieldLabel htmlFor="income-amount">Amount</FieldLabel>
            <Input
              id="income-amount"
              type="number"
              min="0"
              step="0.01"
              value={incomeAmount}
              onChange={(event) => setIncomeAmount(event.target.value)}
              placeholder="Monthly income"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="income-description">Description</FieldLabel>
            <Input
              id="income-description"
              type="text"
              value={incomeDescription}
              onChange={(event) => setIncomeDescription(event.target.value)}
              placeholder="Where this income comes from"
            />
          </Field>
          <Button type="submit" $variant="primary" disabled={savingIncome}>
            {savingIncome ? "Saving..." : "Save"}
          </Button>
        </IncomeForm>
      </Modal>
    </>
  );
}
