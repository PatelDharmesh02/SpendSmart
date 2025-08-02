import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { useAppSelector } from '@/redux/hooks';
import { userCurrentDateSelector } from '@/redux/slices/userSlice';
import AxiosInstance from '@/utils/api';
import { formatCurrency } from '@/utils/currency';
import { DateFormat } from '@/types/user.type';
import { BudgetCompareResponse } from '@/types/budget.type';
import { AppError, handleErrorWithoutHook } from '@/utils/errorHandler';
import { useToast } from '@/lib/ToasteContext';
import { setBudgetError } from '@/redux/slices/budgetSlice';

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

export default function BudgetSummary() {
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<BudgetCompareResponse | null>(null);
  const currentDate: DateFormat = useAppSelector(userCurrentDateSelector);
  const { showToast } = useToast();

  const fetchBudgetCompare = useCallback(async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get<BudgetCompareResponse>(`/budgets/compare?month=${currentDate.year + "-" + currentDate.month.toString().padStart(2, "0")}`)
      if (response.data) { setData(response.data) }
    } catch (error: unknown) {
      // Use our error handler to process the error
      handleErrorWithoutHook(error as AppError, showToast, {
        prefix: "Budget data comparision",
        fallbackMessage: "Budget data comparision failed",
      });
      setBudgetError("Budget comparision failed!!");
    } finally {
      setLoading(false)
    }
  }, [currentDate, showToast]);

  useEffect(() => {
    fetchBudgetCompare();
  }, [currentDate])


  return (
    <div>
      <SummaryContainer>
        <SummaryItem>
          <SummaryLabel>Total Budget</SummaryLabel>
          <SummaryValue>{formatCurrency(0)}</SummaryValue>
        </SummaryItem>
        <SummaryItem>
          <SummaryLabel>Spent</SummaryLabel>
          <SummaryValue>{formatCurrency(0)}</SummaryValue>
        </SummaryItem>
      </SummaryContainer>

      <ProgressContainer>
        <ProgressBar $percentage={50} />
      </ProgressContainer>
    </div>
  );
}