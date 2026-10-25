"use client";

import { useEffect, useRef, useState } from "react";
import styled, { keyframes, useTheme } from "styled-components";
import ReactMarkdown from "react-markdown";
import { Cardano } from "iconsax-react";
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
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

const Body = styled.div`
  color: ${({ theme }) => theme.textPrimary};
  line-height: 1.6;
`;

const sweep = keyframes`
  0% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
`;

const glow = keyframes`
  0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0 rgba(255, 255, 255, 0)); }
  50% { transform: scale(1.12); filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.85)); }
`;

const orbit = keyframes`
  to { transform: rotate(360deg); }
`;

const GenerateButton = styled(Button)<{ $busy?: boolean }>`
  position: relative;
  overflow: hidden;
  isolation: isolate;
  align-self: flex-start;
  width: 240px;
  flex-shrink: 0;
  gap: 0.55rem;
  margin: 0.25rem 0 1rem;
  white-space: nowrap;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 0;
    background: linear-gradient(
      100deg,
      transparent 20%,
      rgba(255, 255, 255, 0.45) 50%,
      transparent 80%
    );
    transform: translateX(-120%);
    animation: ${sweep} ${({ $busy }) => ($busy ? "0.9s" : "2.8s")} ease-in-out infinite;
    pointer-events: none;
  }

  svg {
    position: relative;
    z-index: 1;
    flex-shrink: 0;
    animation: ${({ $busy }) => ($busy ? orbit : glow)} ${({ $busy }) => ($busy ? "1s linear" : "2.2s ease-in-out")} infinite;
  }

  span {
    position: relative;
    z-index: 1;
  }
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
  const theme = useTheme();
  const busy = starting || Boolean(jobId);
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;

  useEffect(() => {
    if (!jobId) return;
    const timer = window.setTimeout(() => {
      setJobId(null);
      showToastRef.current("Insight did not finish. Try again in a moment.", "error");
    }, 60000);
    return () => window.clearTimeout(timer);
  }, [jobId]);

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
      if (created.status === "failed") {
        showToast(created.error || "Insight failed", "error");
        return;
      }
      setJobId(created.id);
    } catch (error) {
      showToast(errorMessage(error, "Could not start insight"), "error");
    }
  };

  return (
    <>
      <Panel>
        <h2>Monthly insight · {month}</h2>
        <GenerateButton type="button" $variant="primary" $busy={busy} onClick={onGenerate} disabled={busy}>
          <Cardano size="20" color={theme.textInverted} variant="Bold" />
          <span>{busy ? "Generating..." : data?.summary ? "Regenerate" : "Generate insight"}</span>
        </GenerateButton>
        {isLoading && <Loader size="md" center />}
        {data?.summary ? (
          <Body>
            <ReactMarkdown>{data.summary}</ReactMarkdown>
          </Body>
        ) : (
          <Body>No cached insight for this month yet. Generate one when you are ready.</Body>
        )}
      </Panel>
    </>
  );
}
