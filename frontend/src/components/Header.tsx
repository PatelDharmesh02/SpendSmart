import React, { useState } from "react";
import styled, { useTheme } from "styled-components";
import { PresentionChart, AddCircle, LogoutCurve } from "iconsax-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/Button";
import { userNameSelector } from "@/redux/slices/userSlice";
import { useAppSelector } from "@/redux/hooks";
import { HambergerMenu, CloseCircle } from "iconsax-react";

const HeaderContainer = styled.header`
  background: ${({ theme }) => theme.cardBg || "#f8f9fa"};
  border-bottom: 1px solid ${({ theme }) => theme.border || "#dee2e6"};
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
  height: 4rem;
`;

const HeaderTitle = styled.p`
  color: ${({ theme }) => theme.textPrimary || "#343a40"};
  font-size: 1.8rem;
  font-weight: 600;
`;

const AppLogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HeaderActionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MenuButtonWrapper = styled(Button)`
  display: none;
  background: none;
  border: none;
  cursor: pointer;

  @media (max-width: 768px) {
    display: block;
    padding: 0.25rem 0.75rem;
    justify-content: flex-start;
    align-items: center;
  }
`;

const MenuPopup = styled.div<{ open: boolean }>`
  display: ${({ open }) => (open ? "flex" : "none")};
  flex-direction: column;
  position: absolute;
  top: 4rem;
  right: 1rem;
  background: ${({ theme }) => theme.cardBg};
  box-shadow: ${({ theme }) => theme.shadow.md};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.radius.lg};
  z-index: 10;

  & > * + * {
    margin-top: 0.5rem;
  }

  @media (min-width: 769px) {
    display: none;
  }
`;

const ButtonWrapper = styled(Button)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
`;

const Avatar = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${({ theme }) => theme.accent || "#e9ecef"};
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.textInverted || "#fff"};
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    transform: scale(1.1);
  }
`;

interface HeaderProps {
  onAddTransaction?: () => void;
  onAddBudget?: () => void;
  handleLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onAddTransaction,
  onAddBudget,
  handleLogout,
}) => {
  const theme = useTheme();
  const userName = useAppSelector(userNameSelector);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <HeaderContainer>
      <AppLogoContainer>
        <PresentionChart size="32" color={theme.primary} variant="Bold" />
        <HeaderTitle>SpendSmart</HeaderTitle>
      </AppLogoContainer>

      <HeaderActionContainer>
        <ButtonWrapper $variant="primary" onClick={onAddTransaction}>
          <AddCircle size="24" color={theme.surface} variant="Outline" />
          Add Transaction
        </ButtonWrapper>
        <ButtonWrapper $variant="primary" onClick={onAddBudget}>
          <AddCircle size="24" color={theme.surface} variant="Outline" />
          Add Budget
        </ButtonWrapper>
        <Avatar>{userName ? userName.charAt(0).toUpperCase() : "U"}</Avatar>
        {handleLogout && (
          <ButtonWrapper $variant="primary" onClick={handleLogout}>
            <LogoutCurve size="24" color={theme.surface} variant="Outline" />
          </ButtonWrapper>
        )}
        <ThemeToggle />
      </HeaderActionContainer>
      <MenuButtonWrapper
        $variant="outline"
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        {menuOpen ? (
          <CloseCircle size={24} color={theme.textPrimary} variant="Outline" />
        ) : (
          <HambergerMenu
            size={24}
            color={theme.textPrimary}
            variant="Outline"
          />
        )}
      </MenuButtonWrapper>
      <MenuPopup open={menuOpen}>
        <ButtonWrapper $variant="primary" onClick={onAddTransaction}>
          <AddCircle size="24" color={theme.surface} variant="Outline" />
          Add Transaction
        </ButtonWrapper>
        <ButtonWrapper $variant="primary" onClick={onAddBudget}>
          <AddCircle size="24" color={theme.surface} variant="Outline" />
          Add Budget
        </ButtonWrapper>
        {handleLogout && (
          <ButtonWrapper $variant="primary" onClick={handleLogout}>
            <LogoutCurve size="24" color={theme.surface} variant="Outline" />
          </ButtonWrapper>
        )}
        <ThemeToggle />
      </MenuPopup>
    </HeaderContainer>
  );
};

export default Header;
