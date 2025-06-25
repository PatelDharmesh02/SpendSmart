// AddBudgetForm.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import Select from '@/components/Select';

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

interface AddBudgetFormProps {
    onSuccess: () => void;
}

export default function AddBudgetForm({ onSuccess }: AddBudgetFormProps) {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');
    const [period, setPeriod] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const categories = [
        'Groceries',
        'Entertainment',
        'Utilities',
        'Transportation',
        'Dining',
        'Shopping',
        'Healthcare',
        'Other'
    ];

    const periods = [
        'daily',
        'weekly',
        'monthly',
        'yearly'
    ];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would submit to your API here
        console.log({ category, amount, period });
        onSuccess();
        //needs to be changed later
        setLoading(false);
        setError('')
    };

    return (
        <Form onSubmit={handleSubmit}>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <FormGroup>
                <Label>Category</Label>
                <Select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </Select>
            </FormGroup>

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
                <Label>Period</Label>
                <Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    required
                >
                    {periods.map(p => (
                        <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                    ))}
                </Select>
            </FormGroup>

            <ButtonContainer>
                <Button
                    type="button"
                    $variant="outline"
                    onClick={onSuccess}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    $variant="primary"
                    disabled={loading}
                >
                    {loading ? 'Creating...' : 'Create Budget'}
                </Button>
            </ButtonContainer>
        </Form>
    );
}