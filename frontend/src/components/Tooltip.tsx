"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import styled from "styled-components";

const Tip = styled.div<{ $placement: "right" | "bottom" }>`
  position: fixed;
  z-index: 40;
  pointer-events: none;
  padding: 0.35rem 0.6rem;
  border-radius: ${({ theme }) => theme.radius.md};
  background: ${({ theme }) => theme.textPrimary};
  color: ${({ theme }) => theme.textInverted};
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.2;
  white-space: nowrap;
  box-shadow: ${({ theme }) => theme.shadow.md};
  transform: ${({ $placement }) =>
    $placement === "bottom" ? "translateX(-50%)" : "translateY(-50%)"};
`;

type TooltipChildProps = {
  onMouseEnter?: (event: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLElement>) => void;
};

function labelIsClipped(node: HTMLElement, label: string) {
  const text = node.querySelector<HTMLElement>("[data-tooltip-text]");
  if (!text) return node.textContent?.trim() !== label.trim();
  const style = window.getComputedStyle(text);
  if (style.display === "none" || style.visibility === "hidden") return true;
  if (text.scrollWidth > text.clientWidth + 1 || text.scrollHeight > text.clientHeight + 1) return true;
  return (text.textContent || "").trim() !== label.trim();
}

export default function Tooltip({
  label,
  placement = "right",
  children,
}: {
  label: string;
  placement?: "right" | "bottom";
  children: React.ReactElement<TooltipChildProps>;
}) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);

  const reveal = (node: HTMLElement) => {
    if (!labelIsClipped(node, label)) {
      setPosition(null);
      return;
    }
    const rect = node.getBoundingClientRect();
    if (placement === "bottom") {
      setPosition({ top: rect.bottom + 8, left: rect.left + rect.width / 2 });
      return;
    }
    setPosition({ top: rect.top + rect.height / 2, left: rect.right + 8 });
  };

  const child = React.cloneElement(children, {
    onMouseEnter: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseEnter?.(event);
      reveal(event.currentTarget);
    },
    onMouseLeave: (event: React.MouseEvent<HTMLElement>) => {
      children.props.onMouseLeave?.(event);
      setPosition(null);
    },
    onFocus: (event: React.FocusEvent<HTMLElement>) => {
      children.props.onFocus?.(event);
      reveal(event.currentTarget);
    },
    onBlur: (event: React.FocusEvent<HTMLElement>) => {
      children.props.onBlur?.(event);
      setPosition(null);
    },
  });

  return (
    <>
      {child}
      {position &&
        createPortal(
          <Tip $placement={placement} role="tooltip" style={{ top: position.top, left: position.left }}>
            {label}
          </Tip>,
          document.body
        )}
    </>
  );
}
