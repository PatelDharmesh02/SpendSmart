import { Calendar } from 'iconsax-react';
import React, { useState, useRef, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';

interface Props {
    value?: Date;
    onApply: (date: Date) => void;
    width?: string
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
  width: ${({ $width }) => $width ? $width : "220px"};
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
  min-width: ${({ $width }) => $width ? $width : "220px"};
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


const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];


const DateDropdownPicker: React.FC<Props> = ({
    value,
    onApply,
    width,
}) => {
    const now = new Date();
    const selectedDate = value || now;

    const [isOpen, setIsOpen] = useState(false);
    const [tempDay, setTempDay] = useState(selectedDate.getDate());
    const [tempMonth, setTempMonth] = useState(selectedDate.getMonth());
    const [tempYear, setTempYear] = useState(selectedDate.getFullYear());

    const wrapperRef = useRef<HTMLDivElement>(null);
    const theme = useTheme();

    const getDaysInMonth = (year: number, month: number) =>
        new Date(year, month + 1, 0).getDate();

    const openDropdown = () => {
        setIsOpen(!isOpen);
    };

    const handleApply = () => {
        const newDate = new Date(tempYear, tempMonth, tempDay);
        onApply(newDate);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setIsOpen(false);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const days = Array.from({ length: getDaysInMonth(tempYear, tempMonth) }, (_, i) => i + 1);

    return (
        <Wrapper ref={wrapperRef}>
            <Button onClick={openDropdown} $width={width}>
                {tempDay} {months[tempMonth]} {tempYear}
                <Calendar size={24} color={theme.textPrimary} />
            </Button>

            {isOpen && (
                <Dropdown $width={width}>
                    <Select
                        value={tempDay}
                        onChange={(e) => setTempDay(Number(e.target.value))}
                    >
                        {days.map(day => (
                            <option key={day} value={day}>{day}</option>
                        ))}
                    </Select>

                    <Select
                        value={tempMonth}
                        onChange={(e) => setTempMonth(Number(e.target.value))}
                    >
                        {months.map((name, index) => (
                            <option key={index} value={index}>{name}</option>
                        ))}
                    </Select>

                    <Select
                        value={tempYear}
                        onChange={(e) => setTempYear(Number(e.target.value))}
                    >
                        {years.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </Select>

                    <ButtonGroup>
                        <ActionButton $cancel onClick={handleCancel}>Cancel</ActionButton>
                        <ActionButton onClick={handleApply}>Apply</ActionButton>
                    </ButtonGroup>
                </Dropdown>
            )}
        </Wrapper>
    );
};

export default DateDropdownPicker;