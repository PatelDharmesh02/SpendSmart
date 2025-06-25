import React from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    PresentionChart,
    MoneySend,
    Wallet,
    Setting,
    LogoutCurve
} from 'iconsax-react';

const SidebarContainer = styled.nav`
  padding: 1.5rem 0;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li<{ $active?: boolean }>`
  margin-bottom: 0.25rem;
  border-left: 4px solid ${({ $active, theme }) => $active ? theme.primary : 'transparent'};
  background: ${({ $active, theme }) => $active ? theme.primaryLight : 'transparent'};
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.surface};
  }
`;

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: ${({ theme }) => theme.textPrimary};
  font-weight: 500;
`;

const MenuIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const MenuText = styled.span`
  font-size: 1rem;
`;

export default function Sidebar() {
    const pathname = usePathname();

    const menuItems = [
        {
            name: 'Dashboard',
            path: '/dashboard',
            icon: <PresentionChart size="20" />
        },
        {
            name: 'Transactions',
            path: '/transactions',
            icon: <MoneySend size="20" />
        },
        {
            name: 'Budgets',
            path: '/budgets',
            icon: <Wallet size="20" />
        },
        {
            name: 'Settings',
            path: '/settings',
            icon: <Setting size="20" />
        },
        {
            name: 'Logout',
            path: '/logout',
            icon: <LogoutCurve size="20" />
        },
    ];

    return (
        <SidebarContainer>
            <MenuList>
                {menuItems.map((item) => (
                    <MenuItem
                        key={item.path}
                        $active={pathname === item.path}
                    >
                        <MenuLink href={item.path}>
                            <MenuIcon>{item.icon}</MenuIcon>
                            <MenuText>{item.name}</MenuText>
                        </MenuLink>
                    </MenuItem>
                ))}
            </MenuList>
        </SidebarContainer>
    );
}