import styled from 'styled-components';
import { formatCurrency } from '@/utils/currency';

const BudgetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const BudgetItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const BudgetHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const BudgetCategory = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.textPrimary};
`;

const BudgetAmount = styled.div`
  color: ${({ theme }) => theme.textSecondary};
`;

const ProgressContainer = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.surface};
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressBar = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${({ $percentage }) => $percentage}%;
  background: ${({ theme }) => theme.primary};
  border-radius: 4px;
`;

interface Budget {
  category: string;
  budgeted: number;
  spent: number;
}

interface BudgetsOverviewProps {
  budgets: Budget[];
}

export default function BudgetsOverview({ budgets }: BudgetsOverviewProps) {
  return (
    <BudgetList>
      {budgets.map((budget, index) => {
        const percentage = (budget.spent / budget.budgeted) * 100;
        return (
          <BudgetItem key={index}>
            <BudgetHeader>
              <BudgetCategory>{budget.category}</BudgetCategory>
              <BudgetAmount>
                {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
              </BudgetAmount>
            </BudgetHeader>
            <ProgressContainer>
              <ProgressBar $percentage={percentage} />
            </ProgressContainer>
          </BudgetItem>
        );
      })}
    </BudgetList>
  );
}