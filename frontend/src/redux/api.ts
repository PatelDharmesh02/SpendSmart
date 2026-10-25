import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { Budget, BudgetCompare, BudgetCreate } from "@/types/budget.type";
import { Transaction, TransactionCreate } from "@/types/transaction.type";
import { UserResponse } from "@/types/user.type";
import { apiBaseUrl } from "@/lib/apiBase";
import { closeSession, isSessionClosed, openSession } from "@/lib/session";
import { loginUser, logoutUser } from "./slices/userSlice";

export type DashboardResponse = {
  month: string;
  income: number;
  monthly_income: number | null;
  income_description: string | null;
  expenses: number;
  net: number;
  savings_rate: number;
  budget_health: number;
  category_breakdown: Record<string, number>;
  budget_vs_actual: BudgetCompare[];
  transactions: Transaction[];
  budgets: Budget[];
};

export type TransactionPage = {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
};

export type TransactionQuery = {
  month: string;
  page?: number;
  page_size?: number;
  search?: string;
  tx_type?: string;
  category?: string;
};

export type Goal = {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  created_at?: string;
};

export type Insight = {
  month: string;
  summary: string | null;
  generated_at?: string | null;
  cached: boolean;
};

export type Job = {
  id: string;
  type: string;
  status: string;
  error?: string | null;
};

type AuthPayload = { user: UserResponse };

const rawBaseQuery = fetchBaseQuery({
  baseUrl: apiBaseUrl(),
  credentials: "include",
});

const AUTH_FREE = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

function requestUrl(args: string | FetchArgs) {
  return typeof args === "string" ? args : args.url;
}

function isAuthFree(url: string) {
  return AUTH_FREE.some((path) => url.includes(path));
}

let refreshInFlight: Promise<boolean> | null = null;

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  const url = requestUrl(args);
  if (isSessionClosed() && !isAuthFree(url)) {
    return { error: { status: 401, data: { detail: "Session ended" } } };
  }

  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status !== 401 || isAuthFree(url)) {
    return result;
  }

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      const refresh = await rawBaseQuery({ url: "/auth/refresh", method: "POST" }, api, extraOptions);
      if (refresh.data) {
        openSession();
        api.dispatch(loginUser((refresh.data as AuthPayload).user));
        return true;
      }
      api.dispatch(logoutUser());
      closeSession();
      return false;
    })().finally(() => {
      refreshInFlight = null;
    });
  }

  const refreshed = await refreshInFlight;
  if (!refreshed) {
    return { error: { status: 401, data: { detail: "Session ended" } } };
  }
  return rawBaseQuery(args, api, extraOptions);
};

export const spendApi = createApi({
  reducerPath: "spendApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Dashboard", "Transaction", "Budget", "Goal", "Insight", "User"],
  endpoints: (builder) => ({
    getMe: builder.query<UserResponse, void>({
      query: () => "/auth/me",
      providesTags: ["User"],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          openSession();
          dispatch(loginUser(data));
        } catch (reason) {
          const status = (reason as { error?: { status?: number } })?.error?.status;
          if (status === 401) dispatch(logoutUser());
        }
      },
    }),
    login: builder.mutation<AuthPayload, { email: string; password: string }>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        openSession();
        dispatch(loginUser(data.user));
      },
    }),
    register: builder.mutation<AuthPayload, { name: string; email: string; password: string }>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        openSession();
        dispatch(loginUser(data.user));
      },
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        await queryFulfilled;
        dispatch(logoutUser());
      },
    }),
    getWsTicket: builder.query<{ ticket: string }, void>({
      query: () => "/auth/ws-ticket",
    }),
    setMonthlyIncome: builder.mutation<
      { month: string; amount: number; description: string | null },
      { month: string; amount: number; description?: string }
    >({
      query: (body) => ({ url: "/income", method: "PUT", body }),
      invalidatesTags: ["Dashboard"],
    }),
    getDashboard: builder.query<DashboardResponse, string>({
      query: (month) => `/dashboard?month=${month}`,
      providesTags: (_result, _error, month) => [{ type: "Dashboard", id: month }],
    }),
    getTransactions: builder.query<TransactionPage, TransactionQuery>({
      query: ({ month, page = 1, page_size = 20, search, tx_type, category }) => {
        const params = new URLSearchParams({ month, page: String(page), page_size: String(page_size) });
        if (search) params.set("search", search);
        if (tx_type) params.set("tx_type", tx_type);
        if (category) params.set("category", category);
        return `/transactions?${params.toString()}`;
      },
      providesTags: ["Transaction"],
    }),
    addTransaction: builder.mutation<Transaction, TransactionCreate>({
      query: (body) => ({ url: "/transactions", method: "POST", body }),
      invalidatesTags: ["Dashboard", "Transaction"],
    }),
    updateTransaction: builder.mutation<Transaction, { id: string } & Partial<TransactionCreate>>({
      query: ({ id, ...body }) => ({ url: `/transactions/${id}`, method: "PUT", body }),
      invalidatesTags: ["Dashboard", "Transaction"],
    }),
    deleteTransaction: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/transactions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Dashboard", "Transaction"],
    }),
    importTransactions: builder.mutation<{ message: string }, { csv_text: string }>({
      query: (body) => ({ url: "/transactions/import", method: "POST", body }),
      invalidatesTags: ["Dashboard", "Transaction"],
    }),
    addBudget: builder.mutation<Budget, BudgetCreate>({
      query: (body) => ({ url: "/budgets", method: "POST", body }),
      invalidatesTags: ["Dashboard", "Budget"],
    }),
    deleteBudget: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/budgets/${id}`, method: "DELETE" }),
      invalidatesTags: ["Dashboard", "Budget"],
    }),
    getGoals: builder.query<Goal[], void>({
      query: () => "/goals",
      providesTags: ["Goal"],
    }),
    addGoal: builder.mutation<Goal, { name: string; target_amount: number; current_amount: number; deadline?: string | null }>({
      query: (body) => ({ url: "/goals", method: "POST", body }),
      invalidatesTags: ["Goal"],
    }),
    updateGoal: builder.mutation<Goal, { id: string; current_amount?: number; name?: string; target_amount?: number }>({
      query: ({ id, ...body }) => ({ url: `/goals/${id}`, method: "PUT", body }),
      invalidatesTags: ["Goal"],
    }),
    deleteGoal: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `/goals/${id}`, method: "DELETE" }),
      invalidatesTags: ["Goal"],
    }),
    getInsight: builder.query<Insight, string>({
      query: (month) => `/ai/summary?month=${month}`,
      providesTags: (_result, _error, month) => [{ type: "Insight", id: month }],
    }),
    regenerateInsight: builder.mutation<Job, string>({
      query: (month) => ({ url: `/ai/summary?month=${month}`, method: "POST" }),
    }),
    getJob: builder.query<Job, string>({
      query: (id) => `/ai/jobs/${id}`,
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLazyGetWsTicketQuery,
  useGetDashboardQuery,
  useSetMonthlyIncomeMutation,
  useGetTransactionsQuery,
  useAddTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useImportTransactionsMutation,
  useAddBudgetMutation,
  useDeleteBudgetMutation,
  useGetGoalsQuery,
  useAddGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useGetInsightQuery,
  useRegenerateInsightMutation,
  useGetJobQuery,
} = spendApi;
