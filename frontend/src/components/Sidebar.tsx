"use client";

import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PresentionChart,
  MoneySend,
  Wallet,
  Setting,
  LogoutCurve,
  Chart,
  Flag,
} from "iconsax-react";

const SidebarContainer = styled.nav<{ $horizontal?: boolean }>`
  padding: ${({ $horizontal }) => ($horizontal ? "0.5rem 1rem" : "1.5rem 0")};
  display: ${({ $horizontal }) => ($horizontal ? "flex" : "block")};
  gap: 0.5rem;
  overflow-x: auto;
`;

const MenuList = styled.ul<{ $horizontal?: boolean }>`
  list-style: none;
  padding: 0;
  margin: 0;
  display: ${({ $horizontal }) => ($horizontal ? "flex" : "block")};
  gap: 0.25rem;
`;

const MenuItem = styled.li<{ $active?: boolean; $horizontal?: boolean }>`
  margin-bottom: ${({ $horizontal }) => ($horizontal ? "0" : "0.25rem")};
  border-left: ${({ $horizontal, $active, theme }) =>
    $horizontal ? "none" : `4px solid ${$active ? theme.primary : "transparent"}`};
  border-bottom: ${({ $horizontal, $active, theme }) =>
    $horizontal ? `2px solid ${$active ? theme.primary : "transparent"}` : "none"};
  background: ${({ $active, theme }) => ($active ? theme.primaryLight : "transparent")};
  border-radius: ${({ $horizontal, theme }) => ($horizontal ? theme.radius.md : "0")};
`;

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  text-decoration: none;
  color: ${({ theme }) => theme.textPrimary};
  font-weight: 500;
  white-space: nowrap;
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  width: 100%;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.textPrimary};
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
`;

const menuItems = [
  { name: "Overview", path: "/dashboard", icon: <PresentionChart size="20" /> },
  { name: "Transactions", path: "/transactions", icon: <MoneySend size="20" /> },
  { name: "Budgets", path: "/budgets", icon: <Wallet size="20" /> },
  { name: "Insights", path: "/insights", icon: <Chart size="20" /> },
  { name: "Goals", path: "/goals", icon: <Flag size="20" /> },
  { name: "Settings", path: "/settings", icon: <Setting size="20" /> },
];

export default function Sidebar({
  onLogout,
  horizontal = false,
}: {
  onLogout?: () => void;
  horizontal?: boolean;
}) {
  const pathname = usePathname();

  return (
    <SidebarContainer $horizontal={horizontal}>
      <MenuList $horizontal={horizontal}>
        {menuItems.map((item) => (
          <MenuItem key={item.path} $active={pathname === item.path} $horizontal={horizontal}>
            <MenuLink href={item.path}>
              {item.icon}
              <span>{item.name}</span>
            </MenuLink>
          </MenuItem>
        ))}
        {onLogout && (
          <MenuItem $horizontal={horizontal}>
            <LogoutButton type="button" onClick={onLogout}>
              <LogoutCurve size="20" />
              <span>Logout</span>
            </LogoutButton>
          </MenuItem>
        )}
      </MenuList>
    </SidebarContainer>
  );
}
