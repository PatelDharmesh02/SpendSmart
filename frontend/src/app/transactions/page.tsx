"use client";

import { useState } from "react";
import styled from "styled-components";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Select from "@/components/Select";
import Modal from "@/components/Modal";
import Loader from "@/components/Loader";
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

const Page = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-shrink: 0;

  & > * {
    flex: 1 1 180px;
    max-width: 280px;
  }

  @media (max-width: 768px) {
    & > * {
      flex-basis: 100%;
      max-width: none;
    }
  }
`;

const TableScroll = styled.div`
  flex: 1;
  min-height: 0;
  overflow: auto;
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.lg};
`;

const Table = styled.table`
  width: 100%;
  min-width: 720px;
  border-collapse: separate;
  border-spacing: 0;
`;

const Th = styled.th`
  position: sticky;
  top: 0;
  z-index: 1;
  text-align: left;
  padding: 0.75rem;
  color: ${({ theme }) => theme.textSecondary};
  background: ${({ theme }) => theme.cardBg};
  border-bottom: 1px solid ${({ theme }) => theme.border};
`;

const Td = styled.td`
  padding: 0.75rem;
  border-top: 1px solid ${({ theme }) => theme.border};
  color: ${({ theme }) => theme.textPrimary};
`;

const Pager = styled.div`
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.textSecondary};
`;

const EditForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
`;

export default function TransactionsPage() {
  const currentDate = useAppSelector(userCurrentDateSelector);
  const authed = useAppSelector(userAuthenticatedSelector);
  const month = monthKey(currentDate);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState<Transaction | null>(null);
  const { showToast } = useToast();
  const { data, isLoading, isError } = useGetTransactionsQuery(
    {
      month,
      page,
      search: search || undefined,
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
    <>
      <Page>
      <Toolbar>
        <Input placeholder="Search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
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
      {isLoading && <Loader size="md" center />}
      {isError && <Empty>Could not load transactions.</Empty>}
      {data && data.items.length === 0 && <Empty>No transactions for this month.</Empty>}
      {data && data.items.length > 0 && (
        <TableScroll>
        <Table>
          <thead>
            <tr>
              <Th>Date</Th>
              <Th>Description</Th>
              <Th>Category</Th>
              <Th>Amount</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((tx) => (
              <tr key={tx.id}>
                <Td>{tx.date}</Td>
                <Td>{tx.desc || tx.merchant || "—"}</Td>
                <Td>{tx.status === "pending" || tx.category === "pending" ? "miscellaneous" : tx.category}</Td>
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
        </TableScroll>
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
      </Page>
      <Modal isOpen={Boolean(editing)} onClose={() => setEditing(null)} title="Edit transaction">
        {editing && (
          <EditForm
            key={editing.id}
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              try {
                await update({
                  id: editing.id,
                  amount: Number(form.get("amount")),
                  desc: String(form.get("desc") || ""),
                  merchant: String(form.get("merchant") || ""),
                  category: String(form.get("category") || editing.category),
                  tx_type: "expense",
                  date: String(form.get("date") || editing.date),
                }).unwrap();
                showToast("Transaction updated", "success");
                setEditing(null);
              } catch (error) {
                showToast(errorMessage(error, "Update failed"), "error");
              }
            }}
          >
            <Field>
              <Label htmlFor="edit-date">Date</Label>
              <Input id="edit-date" name="date" type="date" defaultValue={editing.date} required />
            </Field>
            <Field>
              <Label htmlFor="edit-amount">Amount</Label>
              <Input id="edit-amount" name="amount" type="number" min="0" step="0.01" defaultValue={editing.amount} required />
            </Field>
            <Field>
              <Label htmlFor="edit-desc">Description</Label>
              <Input id="edit-desc" name="desc" type="text" defaultValue={editing.desc || ""} placeholder="What was this for?" />
            </Field>
            <Field>
              <Label htmlFor="edit-merchant">Merchant</Label>
              <Input id="edit-merchant" name="merchant" type="text" defaultValue={editing.merchant || ""} placeholder="Optional" />
            </Field>
            <Field>
              <Label htmlFor="edit-category">Category</Label>
              <Select id="edit-category" name="category" defaultValue={editing.category === "pending" ? "auto" : editing.category}>
                <option value="auto">Auto</option>
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
            </Field>
            <Button type="submit" $variant="primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </EditForm>
        )}
      </Modal>
    </>
  );
}
