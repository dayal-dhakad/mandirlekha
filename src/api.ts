import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { EntryType, Location, Summary, Transaction } from "./types";
export interface Filters {
  from?: string;
  to?: string;
  location?: Location;
  type?: EntryType;
  page?: number;
  limit?: number;
}
const queryString = <T extends object>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== ""),
  );
export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL || "http://localhost:4000/api",
    credentials: "include",
  }),
  tagTypes: ["Auth", "Transaction", "Export"],
  endpoints: (b) => ({
    login: b.mutation<
      { owner: { name: string; email: string } },
      { email: string; password: string }
    >({
      query: (body) => ({ url: "auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    logout: b.mutation<void, void>({
      query: () => ({ url: "auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
    me: b.query<{ owner: { name: string; email: string } }, void>({
      query: () => "auth/me",
      providesTags: ["Auth"],
    }),
    dashboard: b.query<
      { locations: Record<Location, Summary>; overall: Summary },
      { from: string; to: string }
    >({
      query: (p) => ({ url: "dashboard", params: p }),
      providesTags: ["Transaction"],
    }),
    transactions: b.query<
      {
        data: Transaction[];
        pagination: { page: number; pages: number; total: number };
      },
      Filters
    >({
      query: (p) => ({ url: "transactions", params: queryString(p) }),
      providesTags: ["Transaction"],
    }),
    transaction: b.query<Transaction, string>({
      query: (id) => `transactions/${id}`,
      providesTags: ["Transaction"],
    }),
    createTransaction: b.mutation<Transaction, unknown>({
      query: (body) => ({ url: "transactions", method: "POST", body }),
      invalidatesTags: ["Transaction"],
    }),
    updateTransaction: b.mutation<Transaction, { id: string; body: unknown }>({
      query: ({ id, body }) => ({
        url: `transactions/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Transaction"],
    }),
    deleteTransaction: b.mutation<void, string>({
      query: (id) => ({ url: `transactions/${id}`, method: "DELETE" }),
      invalidatesTags: ["Transaction"],
    }),
    createExport: b.mutation<
      { id: string; status: "PENDING" },
      Filters & { format: "XLSX" | "PDF"; language: "en" | "hi" }
    >({ query: (body) => ({ url: "exports", method: "POST", body }), invalidatesTags: ["Export"] }),
    exports: b.query<
      { data: {
        id: string;
        format: string;
        status: "PENDING" | "COMPLETED" | "FAILED";
        filters: Filters;
        recordCount: number;
        fileName?: string;
        errorMessage?: string;
        createdAt: string;
        completedAt?: string;
      }[]; pagination: { page: number; limit: number; total: number; pages: number } },
      { page: number; limit: number }
    >({ query: (params) => ({ url: "exports", params }), providesTags: ["Export"] }),
  }),
});
export const {
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useDashboardQuery,
  useTransactionsQuery,
  useTransactionQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useCreateExportMutation,
  useExportsQuery,
} = api;
