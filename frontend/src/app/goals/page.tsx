"use client";

import { useState } from "react";
import styled from "styled-components";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import Loader from "@/components/Loader";
import Modal from "@/components/Modal";
import { Goal, useAddGoalMutation, useDeleteGoalMutation, useGetGoalsQuery, useUpdateGoalMutation } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { userAuthenticatedSelector } from "@/redux/slices/userSlice";
import { errorMessage, formatMoney } from "@/lib/finance";
import { useToast } from "@/lib/ToasteContext";

const Panel = styled.section`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 1.25rem;
  margin-bottom: 1rem;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: end;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.article`
  border-top: 1px solid ${({ theme }) => theme.border};
  padding: 1rem 0;
`;

const Track = styled.div`
  height: 8px;
  background: ${({ theme }) => theme.surfaceLight};
  border-radius: 99px;
  overflow: hidden;
  margin: 0.5rem 0;
`;

const Fill = styled.div<{ $width: number }>`
  height: 100%;
  width: ${({ $width }) => $width}%;
  background: ${({ theme }) => theme.primary};
`;

const UpdateForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FieldLabel = styled.label`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.textSecondary};
`;

export default function GoalsPage() {
  const authed = useAppSelector(userAuthenticatedSelector);
  const { data, isLoading } = useGetGoalsQuery(undefined, { skip: !authed });
  const [addGoal, { isLoading: saving }] = useAddGoalMutation();
  const [updateGoal, { isLoading: updating }] = useUpdateGoalMutation();
  const [remove] = useDeleteGoalMutation();
  const { showToast } = useToast();
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [saved, setSaved] = useState("");
  const [deadline, setDeadline] = useState("");
  const [editing, setEditing] = useState<Goal | null>(null);
  const [savedAmount, setSavedAmount] = useState("");

  return (
    <>
      <Panel>
        <h2>Savings goals</h2>
        <Form
          onSubmit={async (event) => {
            event.preventDefault();
            try {
              await addGoal({
                name,
                target_amount: Number(target),
                current_amount: Number(saved || 0),
                deadline: deadline || null,
              }).unwrap();
              setName("");
              setTarget("");
              setSaved("");
              setDeadline("");
              showToast("Goal created", "success");
            } catch (error) {
              showToast(errorMessage(error, "Could not create goal"), "error");
            }
          }}
        >
          <Input placeholder="Goal name" value={name} onChange={(event) => setName(event.target.value)} required />
          <Input placeholder="Target" type="number" value={target} onChange={(event) => setTarget(event.target.value)} required />
          <Input placeholder="Saved so far" type="number" value={saved} onChange={(event) => setSaved(event.target.value)} />
          <Input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          <Button type="submit" $variant="primary" disabled={saving}>Add</Button>
        </Form>
      </Panel>
      <Panel style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", marginBottom: 0 }}>
        {isLoading && <Loader size="md" center />}
        {data?.length === 0 && <p>No goals yet.</p>}
        {data?.map((goal) => {
          const width = goal.target_amount > 0 ? Math.min(100, (goal.current_amount / goal.target_amount) * 100) : 0;
          return (
            <Card key={goal.id}>
              <strong>{goal.name}</strong>
              <div>
                {formatMoney(goal.current_amount)} of {formatMoney(goal.target_amount)}
                {goal.deadline ? ` · due ${goal.deadline}` : ""}
              </div>
              <Track>
                <Fill $width={width} />
              </Track>
              <Button
                type="button"
                $variant="outline"
                onClick={() => {
                  setEditing(goal);
                  setSavedAmount(String(goal.current_amount));
                }}
              >
                Update saved
              </Button>
              <Button
                type="button"
                $variant="ghost"
                onClick={async () => {
                  try {
                    await remove(goal.id).unwrap();
                  } catch (error) {
                    showToast(errorMessage(error, "Could not delete goal"), "error");
                  }
                }}
              >
                Delete
              </Button>
            </Card>
          );
        })}
      </Panel>
      <Modal
        isOpen={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing ? `Update saved · ${editing.name}` : "Update saved"}
      >
        <UpdateForm
          onSubmit={async (event) => {
            event.preventDefault();
            if (!editing) return;
            const amount = Number(savedAmount);
            if (Number.isNaN(amount) || amount < 0) {
              showToast("Enter a saved amount of zero or more.", "error");
              return;
            }
            try {
              await updateGoal({ id: editing.id, current_amount: amount }).unwrap();
              showToast("Saved amount updated", "success");
              setEditing(null);
            } catch (error) {
              showToast(errorMessage(error, "Could not update goal"), "error");
            }
          }}
        >
          <FieldLabel htmlFor="saved-amount">Saved so far</FieldLabel>
          <Input
            id="saved-amount"
            type="number"
            min="0"
            step="0.01"
            value={savedAmount}
            onChange={(event) => setSavedAmount(event.target.value)}
            required
          />
          <Button type="submit" $variant="primary" disabled={updating}>
            {updating ? "Saving..." : "Save"}
          </Button>
        </UpdateForm>
      </Modal>
    </>
  );
}
