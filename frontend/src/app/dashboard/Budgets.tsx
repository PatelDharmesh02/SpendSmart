import React, { useState, useEffect, useCallback } from "react";
import styled, { useTheme } from "styled-components";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { formatCurrency } from "@/utils/currency";
import { Budget } from "@/types/budget.type";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { handleDeleteBudget } from "@/redux/thunk";
import {
  budgetsSelector,
  budgetLoadingSelector,
  budgetErrorSelector,
} from "@/redux/slices/budgetSlice";
import { userCurrentDateSelector } from "@/redux/slices/userSlice";
import AxiosInstance from "@/utils/api";
import { useToast } from "@/lib/ToasteContext";
import { AppError, handleErrorWithoutHook } from "@/utils/errorHandler";
import { Trash, Next, Previous } from "iconsax-react";
import Loader from "@/components/Loader";
import { Button } from "@/components/Button";

const Container = styled.div`
  width: 100%;
  height: 90%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.surface};
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr<{ $isSelected?: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? `${theme.primary}30` : "transparent"};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      $isSelected ? `${theme.primary}30` : `${theme.surfaceLight}`};
  }
`;

const TableHeader = styled.th`
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: ${({ theme }) => theme.textSecondary};
`;

const TableCell = styled.td`
  padding: 0.75rem;
  color: ${({ theme }) => theme.textPrimary};
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
  height: 200px;
  width: 100%;
`;

const ErrorText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.danger};
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const PaginationButton = styled(Button)<{ $disabled?: boolean }>`
  padding: 0.25rem;
`;

const PaginationInfo = styled.div`
  color: ${({ theme }) => theme.textSecondary};
`;

const DeleteButton = styled(Button)<{ $disabled?: boolean }>`
  padding: 0.25rem;
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
`;

export default function Budgets() {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const theme = useTheme();

  // Get the current month's data
  const currentDate = useAppSelector(userCurrentDateSelector);
  const formattedMonth = `${currentDate.year}-${currentDate.month
    .toString()
    .padStart(2, "0")}`;

  const storeBudgets = useAppSelector(budgetsSelector);
  const loading = useAppSelector(budgetLoadingSelector);
  const error = useAppSelector(budgetErrorSelector);

  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [rowSelection, setRowSelection] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBudgets = useCallback(async () => {
    try {
      const response = await AxiosInstance.get(
        `/budgets/by-month?month=${formattedMonth}`
      );
      if (response.data) {
        setBudgets(response.data);
      }
    } catch (error: unknown) {
      handleErrorWithoutHook(error as AppError, showToast, {
        prefix: "Budgets",
        fallbackMessage: "Failed to fetch budgets",
      });
    }
  }, [formattedMonth]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets, storeBudgets]);

  const columns = React.useMemo<ColumnDef<Budget>[]>(
    () => [
      {
        accessorKey: "category",
        header: "Category",
        cell: (info) => {
          const category = info.getValue() as string;
          return category.charAt(0).toUpperCase() + category.slice(1);
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: (info) => formatCurrency(info.getValue() as number),
      },
      {
        accessorKey: "created_at",
        header: "Created On",
        cell: (info) => {
          const date = new Date(info.getValue() as string);
          return date.toLocaleDateString();
        },
      },
    ],
    []
  );

  const table = useReactTable({
    data: budgets,
    columns,
    state: {
      rowSelection,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 6,
      },
    },
  });

  const handleDelete = async () => {
    const selectedRows = Object.keys(rowSelection).map(
      (index) => budgets[parseInt(index)]
    );

    if (selectedRows.length === 0) {
      showToast("No budgets selected", "error");
      return;
    }

    setIsDeleting(true);
    try {
      // Delete selected budgets one by one
      for (const budget of selectedRows) {
        if (budget.id) {
          await dispatch(handleDeleteBudget(budget.id)).unwrap();
        }
      }

      showToast(
        `Successfully deleted ${selectedRows.length} budget${
          selectedRows.length > 1 ? "s" : ""
        }`,
        "success"
      );
      setRowSelection({});
    } catch (error) {
      handleErrorWithoutHook(error as AppError, showToast, {
        prefix: "Budgets",
        fallbackMessage: "Failed to delete budgets",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && !isDeleting) {
    return (
      <LoadingContainer>
        <Loader size="md" />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <ErrorText>{error}</ErrorText>
      </ErrorContainer>
    );
  }

  const selectedRows = Object.keys(rowSelection).length;

  return (
    <Container>
      {selectedRows > 0 && (
        <DeleteButton
          $variant="ghost"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash size="18" color={theme.danger} />
        </DeleteButton>
      )}

      {budgets.length > 0 ? (
        <>
          <Table>
            <TableHead>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHeader key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHeader>
                  ))}
                </TableRow>
              ))}
            </TableHead>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  $isSelected={row.getIsSelected()}
                  onClick={() => row.toggleSelected(!row.getIsSelected())}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <PaginationContainer>
            <PaginationButton
              $variant="outline"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </PaginationButton>
            <PaginationButton
              $variant="ghost"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <Previous size="20" color={theme.textPrimary} />
            </PaginationButton>

            <PaginationInfo>
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </PaginationInfo>

            <PaginationButton
              $variant="ghost"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <Next size="20" color={theme.textPrimary} />
            </PaginationButton>
            <PaginationButton
              $variant="outline"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </PaginationButton>
          </PaginationContainer>
        </>
      ) : (
        <NoDataContainer>
          <NoDataText>No budgets available for this month</NoDataText>
        </NoDataContainer>
      )}
    </Container>
  );
}
