// AddTransactionForm.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Select from "@/components/Select";
import { handleAddTransaction } from "@/redux/thunk";
import { AppError, handleErrorWithoutHook } from "@/utils/errorHandler";
import { useAppDispatch } from "@/redux/hooks";
import { useToast } from "@/lib/ToasteContext";
import { TransactionCreate } from "@/types/transaction.type";
import { validateTransactionDetails } from "@/utils/validate";

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

interface AddTransactionFormProps {
  onSuccess: () => void;
}

export default function AddTransactionForm({
  onSuccess,
}: AddTransactionFormProps) {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("auto");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    "Groceries",
    "Entertainment",
    "Utilities",
    "Transportation",
    "Dining",
    "Shopping",
    "Healthcare",
    "Other",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = {
      amount: Number(amount),
      date,
      category,
      desc: description,
    };
    const isFormValid: boolean = validateTransactionDetails(
      formData as TransactionCreate
    );
    if (!isFormValid) {
      setError("Please fill all mandatory fields!");
      return;
    }
    try {
      await dispatch(
        handleAddTransaction(formData as TransactionCreate)
      ).unwrap();
      showToast("Transaction added successfully!", "success");
      onSuccess?.();
    } catch (error: unknown) {
      handleErrorWithoutHook(error as AppError, showToast, {
        prefix: "Failed to add transaction",
        fallbackMessage: "Failed to add transaction. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <FormGroup>
        <Label>Amount</Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="0.00"
        />
      </FormGroup>

      <FormGroup>
        <Label>Description</Label>
        <Input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="Transaction description"
        />
      </FormGroup>

      <FormGroup>
        <Label>Category</Label>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>Date</Label>
        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </FormGroup>

      <ButtonContainer>
        <Button type="button" $variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" $variant="primary" disabled={loading}>
          {loading ? "Adding..." : "Add Transaction"}
        </Button>
      </ButtonContainer>
    </Form>
  );
}
