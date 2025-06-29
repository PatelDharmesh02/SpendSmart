// AddBudgetForm.tsx
import React, { useState } from "react";
import styled from "styled-components";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Select from "@/components/Select";
import { BudgetCreate } from "@/types/budget.type";
import { validateBudgetDetails } from "@/utils/validate";
import { handleAddBudget } from "@/redux/thunk";
import { AppError, handleErrorWithoutHook } from "@/utils/errorHandler";
import { useAppDispatch } from "@/redux/hooks";
import { useToast } from "@/lib/ToasteContext";

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
  display: flex;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Required = styled.p`
  color: red;
  font-size: 0.875rem;
  margin: 0;
`;

const ErrorContainer = styled.p`
  margin: 0;
  color: red;
  font-size: 0.875rem;
`;

interface AddBudgetFormProps {
  onSuccess: () => void;
}

const categories = [
  "groceries",
  "rent",
  "food",
  "travel",
  "salary",
  "utilities",
  "entertainment",
  "subscriptions",
  "shopping",
  "health",
  "miscellaneous",
];

export default function AddBudgetForm({ onSuccess }: AddBudgetFormProps) {
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [month, setMonth] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const formData = { category, amount: Number(amount), month };
    const isFormValid: boolean = validateBudgetDetails(
      formData as BudgetCreate
    );
    if (!isFormValid) {
      setError("Please fill all mandatory fields!");
      return;
    }
    try {
      await dispatch(handleAddBudget(formData as BudgetCreate)).unwrap();
      showToast("Budget added successfully!", "success");
      onSuccess?.();
    } catch (error: unknown) {
      handleErrorWithoutHook(error as AppError, showToast, {
        prefix: "Failed to add budget",
        fallbackMessage: "Failed to add budget. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label>
          Category <Required>*</Required>
        </Label>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat.charAt(0).toUpperCase() + cat.substring(1)}
            </option>
          ))}
        </Select>
      </FormGroup>

      <FormGroup>
        <Label>
          Amount <Required>*</Required>
        </Label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          placeholder="0.00"
        />
      </FormGroup>

      <FormGroup>
        <Label>
          Month <Required>*</Required>
        </Label>
        <Input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
        />
      </FormGroup>

      <ButtonContainer>
        <Button type="button" $variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit" $variant="primary" disabled={loading}>
          {loading ? "Creating..." : "Create Budget"}
        </Button>
      </ButtonContainer>
      {error && <ErrorContainer>{error}</ErrorContainer>}
    </Form>
  );
}
