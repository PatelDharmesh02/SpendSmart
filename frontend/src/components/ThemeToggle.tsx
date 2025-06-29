"use client";

import { useTheme } from "@/lib/ThemeRegistry";
import styled from "styled-components";
import { Moon, Sun1 } from "iconsax-react";
import { useToast } from "@/lib/ToasteContext";

const ToggleButton = styled.button`
  background: ${({ theme }) => theme.gradientSecondary};
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px;
  transition: all 0.3s ease;
  color: white;

  &:hover {
    transform: scale(1.1);
  }
`;

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();

  const handleToggleTheme = () => {
    toggleTheme();
    showToast(
      `Switched to ${theme === "light" ? "dark" : "light"} mode!`,
      "success"
    );
  };

  return (
    <ToggleButton onClick={handleToggleTheme} aria-label="Toggle theme">
      {theme === "light" ? (
        <Moon size="18" variant="Outline" color="white" />
      ) : (
        <Sun1 size="18" variant="Outline" color="white" />
      )}
    </ToggleButton>
  );
};
