"use client";

import { useEffect, useRef } from "react";
import { wsBaseUrl } from "@/lib/apiBase";
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
        const base = wsBaseUrl();
        const next = new WebSocket(`${base}/ws/v1/budget?ticket=${ticket.ticket}`);
        socket = next;
        if (closed) {
          next.close();
          return;
        }
        next.onmessage = (event) => {
          const message = JSON.parse(event.data);
          if (message.type !== "budget_vs_actual" || !message.month) return;
          dispatch(
            spendApi.util.updateQueryData("getDashboard", message.month, (draft) => {
              draft.income = message.income;
              if ("monthly_income" in message) {
                draft.monthly_income = message.monthly_income;
              }
              if ("income_description" in message) {
                draft.income_description = message.income_description;
              }
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
