import { useState, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { useToast } from "@/lib/ToasteContext";
import { AppError, handleErrorWithoutHook } from "@/utils/errorHandler";
import AxiosInstance from "@/utils/api";
import { useAppSelector } from "@/redux/hooks";
import { userCurrentDateSelector } from "@/redux/slices/userSlice";
import { DateFormat } from "@/types/user.type";
import { Nebulas } from "iconsax-react";
import ReactMarkdown from "react-markdown";

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  width: 100%;
  gap: 1rem;
`;

const SummaryContentContainer = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.surfaceLight};
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
`;

const SummaryText = styled.div`
  font-size: 1rem;
  color: ${({ theme }) => theme.textPrimary};
  line-height: 1.6;

  p {
    margin-bottom: 0.75rem;
  }

  ul,
  ol {
    margin-left: 1.5rem;
    margin-bottom: 0.75rem;
  }

  strong {
    color: ${({ theme }) => theme.primary};
    font-weight: 600;
  }

  em {
    font-style: italic;
  }
`;

const gradientAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const GenerateButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.primary} 0%,
    ${({ theme }) => theme.primaryDark} 33%,
    ${({ theme }) => theme.primary} 66%,
    ${({ theme }) => theme.primaryLight} 100%
  );
  background-size: 300% 300%;
  animation: ${gradientAnimation} 3s ease infinite;
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

// Cursor animation
const blink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const Cursor = styled.span`
  display: inline-block;
  width: 0.5rem;
  height: 1.2rem;
  background-color: ${({ theme }) => theme.primary};
  margin-left: 2px;
  animation: ${blink} 1s step-end infinite;
`;

export default function MonthlySummary() {
  const [fullSummary, setFullSummary] = useState<string>("");
  const [displayedSummary, setDisplayedSummary] = useState<string>("");
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const typingSpeed = 20; // milliseconds per character
  const { showToast } = useToast();
  const currentDate: DateFormat = useAppSelector(userCurrentDateSelector);

  // Typewriter effect
  useEffect(() => {
    if (fullSummary && displayedSummary.length < fullSummary.length) {
      setIsTyping(true);
      const timer = setTimeout(() => {
        setDisplayedSummary(
          fullSummary.substring(0, displayedSummary.length + 1)
        );
      }, typingSpeed);

      return () => clearTimeout(timer);
    } else if (fullSummary) {
      setIsTyping(false);
    }
  }, [fullSummary, displayedSummary]);

  useEffect(() => {
    setFullSummary("");
    setDisplayedSummary("");
    setIsTyping(false);
  }, [currentDate]);

  const handleGenerateSummary = async () => {
    setLoading(true);
    setFullSummary("");
    setDisplayedSummary("");

    try {
      const response = await AxiosInstance.get(
        `/ai/summary?month=${
          currentDate.year + "-" + currentDate.month.toString().padStart(2, "0")
        }`
      );

      if (response.data && response.data.summary) {
        setFullSummary(response.data.summary);
        setDisplayedSummary(""); // Reset to start typing effect
        showToast("Summary generated successfully!", "success");
      }
    } catch (error: unknown) {
      // Use our error handler to process the error
      handleErrorWithoutHook(error as AppError, showToast, {
        prefix: "Summary generation",
        fallbackMessage: "Summary generation failed",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SummaryContainer>
      {fullSummary && (
        <SummaryContentContainer>
          <SummaryText>
            <ReactMarkdown>{displayedSummary}</ReactMarkdown>
            {isTyping && <Cursor />}
          </SummaryText>
        </SummaryContentContainer>
      )}
      {!fullSummary && !loading && (
        <SummaryText>Get AI insights for your monthly expenses</SummaryText>
      )}

      <GenerateButton onClick={handleGenerateSummary} disabled={loading}>
        <Nebulas size="20" color="white" />
        {loading ? "Generating..." : "Generate Summary"}
      </GenerateButton>
    </SummaryContainer>
  );
}
