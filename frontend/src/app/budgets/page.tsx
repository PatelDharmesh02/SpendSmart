"use client";

import styled from "styled-components";
import Loader from "@/components/Loader";
import { Button } from "@/components/Button";
import BudgetSummary from "@/app/dashboard/BudgetSummary";
import { useDeleteBudgetMutation, useGetDashboardQuery } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { userAuthenticatedSelector, userCurrentDateSelector } from "@/redux/slices/userSlice";
import { errorMessage, formatMoney, monthKey } from "@/lib/finance";
import { useToast } from "@/lib/ToasteContext";

const Layout = styled.div`
  display: grid;
  gap: 1rem;
  grid-template-columns: 1.2fr 0.8fr;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Panel = styled.section`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 1.25rem;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 0;
  border-top: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textPrimary};
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.textSecondary};
`;

export default function BudgetsPage() {
  const month = monthKey(useAppSelector(userCurrentDateSelector));
  const authed = useAppSelector(userAuthenticatedSelector);
  const { data, isLoading, isError } = useGetDashboardQuery(month, { skip: !authed });
  const [remove] = useDeleteBudgetMutation();
  const { showToast } = useToast();

  return (
    <>
      {isLoading && <Loader size="md" center />}
      {isError && <Empty>Could not load budgets.</Empty>}
      {data && (
        <Layout>
          <Panel>
            <h2>Budgets for {month}</h2>
            {data.budgets.length === 0 && <Empty>Create a category budget for this month.</Empty>}
            {data.budgets.map((budget) => (
              <Row key={budget.id}>
                <span>{budget.category}</span>
                <span>{formatMoney(budget.amount)}</span>
                <Button
                  type="button"
                  $variant="ghost"
                  onClick={async () => {
                    if (!budget.id) return;
                    try {
                      await remove(budget.id).unwrap();
                      showToast("Budget removed", "success");
                    } catch (error) {
                      showToast(errorMessage(error, "Could not delete budget"), "error");
                    }
                  }}
                >
                  Delete
                </Button>
              </Row>
            ))}
          </Panel>
          <Panel>
            <h2>Progress</h2>
            <BudgetSummary rows={data.budget_vs_actual} />
          </Panel>
        </Layout>
      )}
    </>
  );
}
