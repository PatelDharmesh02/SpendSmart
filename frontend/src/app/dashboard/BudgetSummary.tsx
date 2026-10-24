"use client";

import styled from "styled-components";
import { BudgetCompare } from "@/types/budget.type";
import { formatMoney } from "@/lib/finance";

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
`;

const Item = styled.div``;

const LabelRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  margin-bottom: 0.35rem;
  color: ${({ theme }) => theme.textPrimary};
`;

const Track = styled.div`
  height: 8px;
  border-radius: 99px;
  background: ${({ theme }) => theme.surfaceLight};
  overflow: hidden;
`;

const Fill = styled.div<{ $over: boolean; $width: number }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ $over, theme }) => ($over ? theme.danger : theme.primary)};
`;

const Meta = styled.div`
  margin-top: 0.25rem;
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.8rem;
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  margin: 0;
`;

export default function BudgetSummary({ rows }: { rows: BudgetCompare[] }) {
  if (!rows.length) {
    return <Empty>No budgets for this month yet.</Empty>;
  }

  return (
    <Row>
      {rows.map((row) => {
        const width = row.budgeted > 0 ? Math.min(100, (row.spent / row.budgeted) * 100) : 0;
        return (
          <Item key={row.category}>
            <LabelRow>
              <span>{row.category}</span>
              <span>
                {formatMoney(row.spent)} / {formatMoney(row.budgeted)}
              </span>
            </LabelRow>
            <Track>
              <Fill $over={row.spent > row.budgeted} $width={width} />
            </Track>
            <Meta>{formatMoney(row.remaining)} remaining</Meta>
          </Item>
        );
      })}
    </Row>
  );
}
