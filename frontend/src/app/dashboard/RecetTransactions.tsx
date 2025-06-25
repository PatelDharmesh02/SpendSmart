import styled from 'styled-components';
import { formatCurrency } from '@/utils/currency';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background: ${({ theme }) => theme.surface};
`;

const TableRow = styled.tr`
  border-bottom: 1px solid ${({ theme }) => theme.border};
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

interface Transaction {
    date: string;
    category: string;
    amount: number;
}

interface RecentTransactionsProps {
    transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableHeader>Date</TableHeader>
          <TableHeader>Category</TableHeader>
          <TableHeader>Amount</TableHeader>
        </TableRow>
      </TableHead>
      <tbody>
        {transactions.map((transaction, index) => (
          <TableRow key={index}>
            <TableCell>{transaction.date}</TableCell>
            <TableCell>{transaction.category}</TableCell>
            <TableCell>{formatCurrency(transaction.amount)}</TableCell>
          </TableRow>
        ))}
      </tbody>
    </Table>
  );
}