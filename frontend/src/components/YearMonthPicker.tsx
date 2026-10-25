import React, { useCallback, useState, useRef, useEffect } from 'react';
import { Calendar } from 'iconsax-react';
import styled, { useTheme } from 'styled-components';

interface Props {
    value?: { year: number; month: number };
    onApply: (value: { year: number; month: number }) => void;
}

const Wrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const Button = styled.button<{ $width?: string }>`
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.textPrimary};
  transition: background 0.2s, color 0.2s, border 0.2s;
  box-shadow: ${({ theme }) => theme.shadow.sm};
  width: ${({ $width }) => $width ? $width : "180px"};
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
`;

const Dropdown = styled.div<{ $width?: string }>`
  position: absolute;
  top: 110%;
  right: 0;
  left: 0;
  z-index: 1000;
  background-color: ${({ theme }) => theme.surfaceElevated};
  border: 1px solid ${({ theme }) => theme.border};
  padding: 12px;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadow.md};
  min-width: ${({ $width }) => $width ? $width : "180px"};
`;

const Select = styled.select`
  width: 100%;
  margin-bottom: 10px;
  padding: 6px;
  font-size: 14px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.border};
  background-color: ${({ theme }) => theme.surface};
  color: ${({ theme }) => theme.textPrimary};
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
`;

const ActionButton = styled.button<{ $cancel?: boolean }>`
  padding: 6px 12px;
  border-radius: 4px;
  border: none;
  background-color: ${({ $cancel, theme }) => $cancel ? theme.border : theme.primary};
  color: ${({ $cancel, theme }) => $cancel ? theme.textSecondary : theme.textInverted};
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background-color: ${({ $cancel, theme }) => $cancel ? theme.divider : theme.primaryDark};
  }
`;

// Generate year range
const years = Array.from({ length: 20 }, (_, i) => new Date().getFullYear() - 10 + i);
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

// Redux stores month as 1–12. The <select> options are 0–11.
function monthIndex(month: number | undefined): number {
    if (!month) return new Date().getMonth();
    return Math.min(11, Math.max(0, month - 1));
}

const YearMonthDropdown: React.FC<Props> = ({
    value,
    onApply,
}) => {
    const now = new Date();
    const [isOpen, setIsOpen] = useState(false);
    const [tempYear, setTempYear] = useState(value?.year ?? now.getFullYear());
    const [tempMonth, setTempMonth] = useState(monthIndex(value?.month));

    const wrapperRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    const restoreSelection = useCallback(() => {
        setTempYear(value?.year ?? new Date().getFullYear());
        setTempMonth(monthIndex(value?.month));
    }, [value?.year, value?.month]);

    useEffect(() => {
        restoreSelection();
    }, [restoreSelection]);

    const openDropdown = () => {
        if (!isOpen) restoreSelection();
        setIsOpen(!isOpen);
    };

    const handleApply = () => {
        onApply({ year: tempYear, month: tempMonth + 1 });
        setIsOpen(false);
    };

    const handleCancel = () => {
        restoreSelection();
        setIsOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                restoreSelection();
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, restoreSelection]);

    return (
        <Wrapper ref={wrapperRef}>
            <Button onClick={openDropdown}>
                {months[tempMonth]} {tempYear}
                <Calendar size={24} color={theme.textPrimary} />
            </Button>

            {isOpen && (
                <Dropdown>
                    <Select
                        value={tempMonth}
                        onChange={(e) => setTempMonth(Number(e.target.value))}
                    >
                        {months.map((name, i) => (
                            <option value={i} key={i}>{name}</option>
                        ))}
                    </Select>
                    <Select
                        value={tempYear}
                        onChange={(e) => setTempYear(Number(e.target.value))}
                    >
                        {years.map((year) => (
                            <option value={year} key={year}>{year}</option>
                        ))}
                    </Select>
                    <ButtonGroup>
                        <ActionButton onClick={handleCancel} $cancel>
                            Cancel
                        </ActionButton>
                        <ActionButton onClick={handleApply}>
                            Apply
                        </ActionButton>
                    </ButtonGroup>
                </Dropdown>
            )}
        </Wrapper>
    );
};

export default YearMonthDropdown;