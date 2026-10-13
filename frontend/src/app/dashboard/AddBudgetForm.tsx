"use client";

import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Select from "@/components/Select";
import DateDropdownPicker from "@/components/DatePicker";
import { useToast } from "@/lib/ToasteContext";
import { CATEGORIES, errorMessage } from "@/lib/finance";
import { useAddBudgetMutation } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { userCurrentDateSelector } from "@/redux/slices/userSlice";
import { monthKey } from "@/lib/finance";

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
`;

export default function AddBudgetForm({ onSuccess }: { onSuccess: () => void }) {
  const currentDate = useAppSelector(userCurrentDateSelector);
  const [category, setCategory] = useState("groceries");
  const [amount, setAmount] = useState("");
  const [monthDate, setMonthDate] = useState(
    new Date(currentDate.year, currentDate.month - 1, 1)
  );
  const [error, setError] = useState("");
  const [addBudget, { isLoading }] = useAddBudgetMutation();
  const { showToast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const value = Number(amount);
    if (!category || !value) {
      setError("Category and amount are required.");
      return;
    }
    const month = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
    try {
      await addBudget({ category, amount: value, month }).unwrap();
      showToast("Budget saved", "success");
      onSuccess();
    } catch (err) {
      const message = errorMessage(err, "Could not save the budget");
      setError(message);
      showToast(message, "error");
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Month</Label>
        <DateDropdownPicker value={monthDate} onApply={setMonthDate} width="100%" />
        <Label>Selected period defaults to {monthKey(currentDate)}</Label>
      </FormGroup>
      <FormGroup>
        <Label>Category</Label>
        <Select value={category} onChange={(event) => setCategory(event.target.value)} required>
          {CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </Select>
      </FormGroup>
      <FormGroup>
        <Label>Amount</Label>
        <Input type="number" value={amount} onChange={(event) => setAmount(event.target.value)} required placeholder="0.00" />
      </FormGroup>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ButtonContainer>
        <Button type="button" $variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" $variant="primary" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save budget"}
        </Button>
      </ButtonContainer>
    </Form>
  );
}
