"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Select from "@/components/Select";
import DateDropdownPicker from "@/components/DatePicker";
import { useToast } from "@/lib/ToasteContext";
import { CATEGORIES, errorMessage } from "@/lib/finance";
import { useAddTransactionMutation } from "@/redux/api";

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

export default function AddTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const { showToast } = useToast();
  const [addTransaction, { isLoading }] = useAddTransactionMutation();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState("auto");
  const [txType, setTxType] = useState<"expense" | "income">("expense");
  const [transactionDate, setTransactionDate] = useState(new Date());
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!value || value <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    try {
      await addTransaction({
        amount: value,
        date: transactionDate.toISOString().split("T")[0],
        category: category || "auto",
        desc: description,
        merchant,
        tx_type: txType,
      }).unwrap();
      showToast("Transaction added", "success");
      onSuccess();
    } catch (err) {
      const message = errorMessage(err, "Could not add the transaction");
      setError(message);
      showToast(message, "error");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <FormGroup>
        <Label>Date</Label>
        <DateDropdownPicker value={transactionDate} onApply={setTransactionDate} width="100%" />
      </FormGroup>
      <FormGroup>
        <Label>Type</Label>
        <Select value={txType} onChange={(event) => setTxType(event.target.value as "expense" | "income")}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </Select>
      </FormGroup>
      <FormGroup>
        <Label>Amount</Label>
        <Input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} required placeholder="0.00" />
      </FormGroup>
      <FormGroup>
        <Label>Description</Label>
        <Input type="text" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What was this for?" />
      </FormGroup>
      <FormGroup>
        <Label>Merchant</Label>
        <Input type="text" value={merchant} onChange={(event) => setMerchant(event.target.value)} placeholder="Optional" />
      </FormGroup>
      <FormGroup>
        <Label>Category</Label>
        <Select value={category} onChange={(event) => setCategory(event.target.value)}>
          <option value="auto">Auto (AI)</option>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </FormGroup>
      <ButtonContainer>
        <Button type="button" $variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" $variant="primary" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add transaction"}
        </Button>
      </ButtonContainer>
    </Form>
  );
}
