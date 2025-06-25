import styled from 'styled-components';
import { formatCurrency } from '@/utils/currency';

const SummaryContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const SummaryItem = styled.div`
  flex: 1;
`;

const SummaryLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${({ theme }) => theme.textPrimary};
`;

const ProgressContainer = styled.div`
  margin-top: 1.5rem;
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

interface BudgetSummaryProps {
  totalBudget: number;
  spent: number;
}

export default function BudgetSummary({ totalBudget, spent }: BudgetSummaryProps) {
  const percentage = (spent / totalBudget) * 100;

  return (
    <div>
      <SummaryContainer>
        <SummaryItem>
          <SummaryLabel>Total Budget</SummaryLabel>
          <SummaryValue>{formatCurrency(totalBudget)}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Spent</SummaryLabel>
          <SummaryValue>{formatCurrency(spent)}</SummaryValue>
        </SummaryItem>
      </SummaryContainer>

      <ProgressContainer>
        <ProgressBar $percentage={percentage} />
      </ProgressContainer>
    </div>
  );
}