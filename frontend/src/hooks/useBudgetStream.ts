"use client";

import { useEffect, useRef } from "react";
import { spendApi, useLazyGetWsTicketQuery } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";

export function useBudgetStream(enabled: boolean) {
  const dispatch = useAppDispatch();
  const [fetchTicket] = useLazyGetWsTicketQuery();
  const fetchTicketRef = useRef(fetchTicket);
  fetchTicketRef.current = fetchTicket;

  useEffect(() => {
    if (!enabled) return;
    let socket: WebSocket | null = null;
    let closed = false;

    const connect = async () => {
      try {
        const ticket = await fetchTicketRef.current().unwrap();
        if (closed) return;
        const base = process.env.NEXT_PUBLIC_WS_URL || "ws://127.0.0.1:8000";
        socket = new WebSocket(`${base}/ws/v1/budget?ticket=${ticket.ticket}`);
        socket.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type !== "budget_vs_actual" || !message.month) return;
          dispatch(
            spendApi.util.updateQueryData("getDashboard", message.month, (draft) => {
              draft.income = message.income;
              draft.expenses = message.expenses;
              draft.net = message.net;
              draft.savings_rate = message.savings_rate;
              draft.budget_health = message.budget_health;
              draft.category_breakdown = message.category_breakdown;
              draft.budget_vs_actual = message.budget_vs_actual;
              if (message.transaction) {
                const index = draft.transactions.findIndex(
                  (item) => item.id === message.transaction.id
                );
                if (index >= 0) {
                  draft.transactions[index] = {
                    ...draft.transactions[index],
                    ...message.transaction,
                  };
                } else {
                  draft.transactions.unshift(message.transaction);
                }
              }
            })
          );
        };
      } catch {
        return;
      }
    };

    connect();
    return () => {
      closed = true;
      socket?.close();
    };
  }, [dispatch, enabled]);
}
