"use client";

import React from "react";
import styled from "styled-components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PresentionChart,
  MoneySend,
  Wallet,
  LogoutCurve,
  Chart,
  Flag,
  SidebarLeft,
  SidebarRight,
} from "iconsax-react";
import { useTheme } from "styled-components";
import Tooltip from "@/components/Tooltip";

const SidebarContainer = styled.nav<{ $horizontal?: boolean; $collapsed?: boolean }>`
  height: ${({ $horizontal }) => ($horizontal ? "auto" : "100%")};
  padding: ${({ $horizontal, $collapsed }) =>
    $horizontal ? "0.5rem 1rem" : $collapsed ? "0.75rem 0 1rem" : "0.75rem 0 1rem"};
  display: flex;
  flex-direction: ${({ $horizontal }) => ($horizontal ? "row" : "column")};
  gap: 0.5rem;
  overflow-x: auto;
  min-height: 0;
`;

const CollapseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  margin: 0 0 0.5rem 0.75rem;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.border};
  border-radius: ${({ theme }) => theme.radius.md};
  background: transparent;
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;

  svg {
    flex-shrink: 0;
  }
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
    $horizontal
      ? "none"
      : `4px solid ${$active ? theme.primary : "transparent"}`};
  border-bottom: ${({ $horizontal, $active, theme }) =>
    $horizontal
      ? `2px solid ${$active ? theme.primary : "transparent"}`
      : "none"};
  background: ${({ $active, theme }) =>
    $active ? theme.primaryLight : "transparent"};
  border-radius: ${({ $horizontal, theme }) =>
    $horizontal ? theme.radius.md : "0"};
`;

const MenuLink = styled(Link)<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
  gap: 0.75rem;
  padding: ${({ $collapsed }) => ($collapsed ? "0.75rem" : "0.75rem 1.25rem")};
  text-decoration: none;
  color: ${({ theme }) => theme.textPrimary};
  font-weight: 500;
  white-space: nowrap;

  span {
    display: ${({ $collapsed }) => ($collapsed ? "none" : "inline")};
  }

  svg {
    flex-shrink: 0;
  }
`;

const LogoutButton = styled.button<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${({ $collapsed }) => ($collapsed ? "center" : "flex-start")};
  gap: 0.75rem;
  margin-top: auto;
  padding: ${({ $collapsed }) => ($collapsed ? "0.75rem" : "0.75rem 1.25rem")};
  width: 100%;
  border: none;
  border-top: 1px solid ${({ theme }) => theme.border};
  background: transparent;
  color: ${({ theme }) => theme.textPrimary};
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  white-space: nowrap;

  span {
    display: ${({ $collapsed }) => ($collapsed ? "none" : "inline")};
  }

  svg {
    flex-shrink: 0;
  }
`;

const menuItems = [
  { name: "Overview", path: "/dashboard", Icon: PresentionChart },
  { name: "Transactions", path: "/transactions", Icon: MoneySend },
  { name: "Budgets", path: "/budgets", Icon: Wallet },
  { name: "Insights", path: "/insights", Icon: Chart },
  { name: "Goals", path: "/goals", Icon: Flag },
];

export default function Sidebar({
  onLogout,
  horizontal = false,
  collapsed = false,
  onToggleCollapse,
}: {
  onLogout?: () => void;
  horizontal?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const pathname = usePathname();
  const theme = useTheme();
  const iconOnly = collapsed && !horizontal;

  return (
    <SidebarContainer $horizontal={horizontal} $collapsed={iconOnly}>
      {onToggleCollapse && !horizontal && (
        <Tooltip label={iconOnly ? "Expand sidebar" : "Collapse sidebar"}>
          <CollapseButton
            type="button"
            onClick={onToggleCollapse}
            aria-label={iconOnly ? "Expand sidebar" : "Collapse sidebar"}
          >
            {iconOnly ? (
              <SidebarRight size="20" color={theme.textPrimary} />
            ) : (
              <SidebarLeft size="20" color={theme.textPrimary} />
            )}
          </CollapseButton>
        </Tooltip>
      )}
      <MenuList $horizontal={horizontal}>
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            $active={pathname === item.path}
            $horizontal={horizontal}
          >
            <Tooltip label={item.name}>
              <MenuLink href={item.path} $collapsed={iconOnly}>
                <item.Icon size="20" color={theme.textPrimary} />
                <span data-tooltip-text>{item.name}</span>
              </MenuLink>
            </Tooltip>
          </MenuItem>
        ))}
      </MenuList>
      {onLogout && !horizontal && (
        <Tooltip label="Logout">
          <LogoutButton type="button" onClick={onLogout} $collapsed={iconOnly}>
            <LogoutCurve size="20" color={theme.textPrimary} variant="Outline" />
            <span data-tooltip-text>Logout</span>
          </LogoutButton>
        </Tooltip>
      )}
    </SidebarContainer>
  );
}
