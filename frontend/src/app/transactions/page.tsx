"use client";

import { useState } from "react";
import styled from "styled-components";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import Loader from "@/components/Loader";
import AddTransactionForm from "@/app/dashboard/AddTransactionForm";
import {
  useDeleteTransactionMutation,
  useGetTransactionsQuery,
  useImportTransactionsMutation,
  useUpdateTransactionMutation,
} from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { userAuthenticatedSelector, userCurrentDateSelector } from "@/redux/slices/userSlice";
import { CATEGORIES, errorMessage, formatMoney, monthKey } from "@/lib/finance";
import { useToast } from "@/lib/ToasteContext";
import { Transaction } from "@/types/transaction.type";

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const Td = styled.td`
  padding: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textPrimary};
`;

const Badge = styled.span`
  margin-left: 0.35rem;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.primary};
`;

const Pager = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.textSecondary};
`;

export default function TransactionsPage() {
  const currentDate = useAppSelector(userCurrentDateSelector);
  const authed = useAppSelector(userAuthenticatedSelector);
  const month = monthKey(currentDate);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [txType, setTxType] = useState("");
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const { showToast } = useToast();
  const { data, isLoading, isError } = useGetTransactionsQuery(
    {
      month,
      page,
      search: search || undefined,
      tx_type: txType || undefined,
      category: category || undefined,
    },
    { skip: !authed }
  );
  const [remove] = useDeleteTransactionMutation();
  const [update, { isLoading: saving }] = useUpdateTransactionMutation();
  const [importCsv, { isLoading: importing }] = useImportTransactionsMutation();

  const onFile = async (file: File) => {
    const csv_text = await file.text();
    try {
      const result = await importCsv({ csv_text }).unwrap();
      showToast(result.message, "success");
    } catch (error) {
      showToast(errorMessage(error, "Import failed"), "error");
    }
  };

  return (
    <AppShell onAddTransaction={() => setOpen(true)}>
      <Toolbar>
        <Input placeholder="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
        <Select value={txType} onChange={(event) => { setTxType(event.target.value); setPage(1); }}>
          <option value="">All types</option>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
        <Select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </Select>
        <Button type="button" $variant="outline" as="label">
          {importing ? "Importing..." : "Import CSV"}
          <input
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onFile(file);
              event.target.value = "";
            }}
          />
        </Button>
      </Toolbar>
      {isLoading && <Loader size="md" />}
      {isError && <Empty>Could not load transactions.</Empty>}
      {data && data.items.length === 0 && <Empty>No transactions for this month.</Empty>}
      {data && data.items.length > 0 && (
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Type</Th>
              <Th>Amount</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((tx) => (
              <tr key={tx.id}>
                <Td>{tx.date}</Td>
                <Td>{tx.desc || tx.merchant || "—"}</Td>
                <Td>
                  {tx.status === "pending" ? "Categorizing…" : tx.category}
                  {tx.category_source === "ai" && <Badge>AI</Badge>}
                </Td>
                <Td>{tx.tx_type}</Td>
                <Td>{formatMoney(tx.amount)}</Td>
                <Td>
                  <Button type="button" $variant="ghost" onClick={() => setEditing(tx)}>Edit</Button>
                  <Button
                    type="button"
                    $variant="ghost"
                    onClick={async () => {
                      try {
                        await remove(tx.id).unwrap();
                        showToast("Transaction deleted", "success");
                      } catch (error) {
                        showToast(errorMessage(error, "Delete failed"), "error");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {data && data.total > data.page_size && (
        <Pager>
          <Button type="button" $variant="outline" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>
            Previous
          </Button>
          <Button type="button" $variant="outline" disabled={page * data.page_size >= data.total} onClick={() => setPage((value) => value + 1)}>
            Next
          </Button>
        </Pager>
      )}
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add transaction">
        <AddTransactionForm onSuccess={() => setOpen(false)} />
      </Modal>
      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit transaction">
        {editing && (
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              try {
                await update({
                  id: editing.id,
                  amount: Number(form.get("amount")),
                  desc: String(form.get("desc") || ""),
                  category: String(form.get("category") || editing.category),
                  tx_type: String(form.get("tx_type") || "expense") as "expense" | "income",
                  date: editing.date,
                }).unwrap();
                showToast("Transaction updated", "success");
                setEditing(null);
              } catch (error) {
                showToast(errorMessage(error, "Update failed"), "error");
              }
            }}
          >
            <Input name="amount" type="number" defaultValue={editing.amount} required />
            <Input name="desc" defaultValue={editing.desc || ""} />
            <Select name="category" defaultValue={editing.category}>
              {CATEGORIES.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select name="tx_type" defaultValue={editing.tx_type || "expense"}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </Select>
            <Button type="submit" $variant="primary" disabled={saving} style={{ marginTop: "1rem" }}>
              Save
            </Button>
          </form>
        )}
      </Modal>
    </AppShell>
  );
}
