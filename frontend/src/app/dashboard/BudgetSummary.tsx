import { useState, useEffect, useCallback } from "react";
import styled from "styled-components";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { userCurrentDateSelector } from "@/redux/slices/userSlice";
import AxiosInstance from "@/utils/api";
import { formatCurrency } from "@/utils/currency";
import { DateFormat } from "@/types/user.type";
import { BudgetCompareResponse } from "@/types/budget.type";
import { AppError, handleErrorWithoutHook } from "@/utils/errorHandler";
import { useToast } from "@/lib/ToasteContext";
import {
  budgetErrorSelector,
  budgetLoadingSelector,
  budgetsSelector,
  setBudgetError,
  setBudgetLoading,
} from "@/redux/slices/budgetSlice";
import Loader from "@/components/Loader";
import { transactionsSelector } from "@/redux/slices/transactionSlice";

const LoaderContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 1.5rem;
  height: 100%;
`;

const CategoryItem = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const CategoryHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

const CategoryName = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.textPrimary};
`;

const BudgetValues = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ProgressContainer = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.surfaceLight};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.25rem;
`;

const ProgressBar = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${({ $percentage }) => Math.min($percentage, 100)}%;
  background-color: ${({ theme }) => theme.primary};
  border-radius: 4px;
`;

const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const NoDataText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
`;

const ErrorText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.danger};
`;

export default function BudgetSummary() {
  const [data, setData] = useState<BudgetCompareResponse>([]);
  const dispatch = useAppDispatch();
  const currentDate: DateFormat = useAppSelector(userCurrentDateSelector);
  const budgetData = useAppSelector(budgetsSelector);
  const budgetLoading = useAppSelector(budgetLoadingSelector);
  const transactionData = useAppSelector(transactionsSelector);
  const budgetError = useAppSelector(budgetErrorSelector);
  const { showToast } = useToast();

  const fetchBudgetCompare = useCallback(async () => {
    dispatch(setBudgetLoading(true));
    try {
      const response = await AxiosInstance.get<BudgetCompareResponse>(
        `/budgets/compare?month=${
          currentDate.year + "-" + currentDate.month.toString().padStart(2, "0")
        }`
      );
      if (response.data) {
        setData(response.data);
      }
    } catch (error: unknown) {
      // Use our error handler to process the error
      handleErrorWithoutHook(error as AppError, showToast, {
        prefix: "Budget data comparison",
        fallbackMessage: "Budget data comparison failed",
      });
      dispatch(setBudgetError("Budget comparison failed!!"));
    } finally {
      dispatch(setBudgetLoading(false));
    }
  }, [currentDate, showToast, dispatch]);

  useEffect(() => {
    fetchBudgetCompare();
  }, [currentDate, budgetData, transactionData, fetchBudgetCompare]);

  if (budgetLoading) {
    return (
      <LoaderContainer>
        <Loader size="md" />
      </LoaderContainer>
    );
  }

  if (budgetError) {
    return (
      <ErrorContainer>
        <ErrorText>{budgetError}</ErrorText>
      </ErrorContainer>
    );
  }

  return (
    <SummaryContainer>
      {data.length > 0 ? (
        data.map((item, index) => {
          const spendingPercentage =
            item.budgeted > 0 ? (item.spent / item.budgeted) * 100 : 0;

          return (
            <CategoryItem key={`${item.category}-${index}`}>
              <CategoryHeader>
                <CategoryName>
                  {item.category.charAt(0).toUpperCase() +
                    item.category.slice(1)}
                </CategoryName>
                <BudgetValues>
                  {formatCurrency(item.spent)} / {formatCurrency(item.budgeted)}
                </BudgetValues>
              </CategoryHeader>
              <ProgressContainer>
                <ProgressBar $percentage={spendingPercentage} />
              </ProgressContainer>
            </CategoryItem>
          );
        })
      ) : (
        <NoDataContainer>
          <NoDataText>No data available for the selected month!</NoDataText>
        </NoDataContainer>
      )}
    </SummaryContainer>
  );
}
