"use client";

import { useEffect, useState } from "react";
import styled from "styled-components";
import ReactMarkdown from "react-markdown";
import AppShell from "@/components/AppShell";
import { Button } from "@/components/Button";
import Loader from "@/components/Loader";
import { useGetInsightQuery, useGetJobQuery, useRegenerateInsightMutation } from "@/redux/api";
import { useAppSelector } from "@/redux/hooks";
import { userAuthenticatedSelector, userCurrentDateSelector } from "@/redux/slices/userSlice";
import { errorMessage, monthKey } from "@/lib/finance";
import { useToast } from "@/lib/ToasteContext";

const Panel = styled.section`
  background: ${({ theme }) => theme.cardBg};
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: 1.5rem;
  max-width: 860px;
`;

const Body = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  line-height: 1.6;
`;

export default function InsightsPage() {
  const month = monthKey(useAppSelector(userCurrentDateSelector));
  const authed = useAppSelector(userAuthenticatedSelector);
  const { data, isLoading, refetch } = useGetInsightQuery(month, { skip: !authed });
  const [regenerate, { isLoading: starting }] = useRegenerateInsightMutation();
  const [jobId, setJobId] = useState<string | null>(null);
  const { data: job } = useGetJobQuery(jobId || "", {
    skip: !jobId || !authed,
    pollingInterval: jobId && authed ? 1200 : 0,
  });
  const { showToast } = useToast();

  useEffect(() => {
    if (!jobId || !job || job.id !== jobId) return;
    if (job.status === "done") {
      refetch();
      setJobId(null);
      showToast("Insight ready", "success");
    }
    if (job.status === "failed") {
      showToast(job.error || "Insight failed", "error");
      setJobId(null);
    }
  }, [job, jobId, refetch, showToast]);

  const onGenerate = async () => {
    try {
      const created = await regenerate(month).unwrap();
      if (created.status === "done") {
        refetch();
        showToast("Insight ready", "success");
        return;
      }
      setJobId(created.id);
    } catch (error) {
      showToast(errorMessage(error, "Could not start insight"), "error");
    }
  };

  return (
    <AppShell>
      <Panel>
        <h2>Monthly insight · {month}</h2>
        <Button type="button" $variant="primary" onClick={onGenerate} disabled={starting || Boolean(jobId)}>
          {starting || jobId ? "Generating..." : data?.summary ? "Regenerate" : "Generate insight"}
        </Button>
        {isLoading && <Loader size="md" />}
        {data?.summary ? (
          <Body>
            <ReactMarkdown>{data.summary}</ReactMarkdown>
          </Body>
        ) : (
          <Body>No cached insight for this month yet. Generate one when you are ready.</Body>
        )}
      </Panel>
    </AppShell>
  );
}
