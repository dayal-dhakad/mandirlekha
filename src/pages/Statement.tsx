import { useState } from "react";
import { Link } from "react-router-dom";
import { Eye, FileSpreadsheet, FileText, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useCreateExportMutation,
  useDeleteTransactionMutation,
  useTransactionsQuery,
} from "../api";
import type { EntryType, Location } from "../types";

export function Statement() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<{
    from?: string;
    to?: string;
    location?: Location;
    type?: EntryType;
    page: number;
    limit: number;
  }>({ page: 1, limit: 10 });
  const { data, isLoading } = useTransactionsQuery(filters);
  const [deleteTransaction] = useDeleteTransactionMutation();
  const [createExport, { isLoading: isCreatingExport }] =
    useCreateExportMutation();
  const [exportNotice, setExportNotice] = useState("");
  const [reportLanguage, setReportLanguage] = useState<"hi" | "en">("hi");
  const change = (key: string, value: string) =>
    setFilters((current) => ({
      ...current,
      [key]: value || undefined,
      page: 1,
    }));
  const remove = (id: string) =>
    confirm("Delete this complete entry?") && deleteTransaction(id);
  const exportReport = async (format: "PDF" | "XLSX") => {
    setExportNotice("");
    try {
      await createExport({
        format,
        language: reportLanguage,
        from: filters.from,
        to: filters.to,
        location: filters.location,
        type: filters.type,
      }).unwrap();
      setExportNotice(
        `${format === "PDF" ? "PDF" : "Excel"} report added to Export History. It is being generated.`,
      );
    } catch {
      setExportNotice("Could not start report generation. Please try again.");
    }
  };
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-maroon sm:text-3xl">
          {t("statement")}
        </h1>
        <div className="flex gap-2">
          <select aria-label="Report language" title="Report language" value={reportLanguage} onChange={(event) => setReportLanguage(event.target.value as "hi" | "en")} className="h-11 rounded-xl border border-amber-200 bg-white px-2 text-sm font-semibold text-maroon">
            <option value="hi">हिन्दी</option>
            <option value="en">English</option>
          </select>
          <button
            type="button"
            disabled={isCreatingExport}
            onClick={() => exportReport("PDF")}
            aria-label="Generate PDF report with active filters"
            title="Export PDF"
            className="grid h-11 w-11 place-items-center rounded-xl bg-red-700 text-white transition hover:bg-red-800 disabled:opacity-50"
          >
            <FileText size={20} />
          </button>
          <button
            type="button"
            disabled={isCreatingExport}
            onClick={() => exportReport("XLSX")}
            aria-label="Generate Excel report with active filters"
            title="Export Excel"
            className="grid h-11 w-11 place-items-center rounded-xl bg-green-700 text-white transition hover:bg-green-800 disabled:opacity-50"
          >
            <FileSpreadsheet size={20} />
          </button>
        </div>
      </div>
      {exportNotice && (
        <div
          role="status"
          className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"
        >
          <span>{exportNotice}</span>
          <Link
            to="/exports"
            className="shrink-0 font-bold text-maroon underline"
          >
            View History
          </Link>
        </div>
      )}
      <div className="card mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div>
          <label className="label">From</label>
          <input
            className="input"
            type="date"
            onChange={(e) => change("from", e.target.value)}
          />
        </div>
        <div>
          <label className="label">To</label>
          <input
            className="input"
            type="date"
            onChange={(e) => change("to", e.target.value)}
          />
        </div>
        <select
          aria-label="Location filter"
          className="input col-span-2 md:col-span-1"
          onChange={(e) => change("location", e.target.value)}
        >
          <option value="">
            {t("all")} {t("location")}
          </option>
          <option value="MANDIR">{t("mandir")}</option>
          <option value="DHARAMSHALA">{t("dharamshala")}</option>
        </select>
        <select
          aria-label="Type filter"
          className="input col-span-2 md:col-span-1"
          onChange={(e) => change("type", e.target.value)}
        >
          <option value="">
            {t("all")} {t("type")}
          </option>
          <option value="INCOME">{t("income")}</option>
          <option value="EXPENSE">{t("expense")}</option>
        </select>
      </div>
      <div className="space-y-3 md:hidden">
        {isLoading ? (
          <div className="card">Loading…</div>
        ) : data?.data.length ? (
          data.data.map((entry) => (
            <article className="card" key={entry.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-stone-500">
                    {entry.date} · {t(entry.location.toLowerCase())}
                  </p>
                  <p
                    className={`mt-1 text-sm font-bold ${entry.type === "INCOME" ? "text-green-700" : entry.type === "EXPENSE" ? "text-red-700" : "text-amber-700"}`}
                  >
                    {entry.type.replace("_", " ")}
                  </p>
                </div>
                <p className="shrink-0 text-lg font-bold">
                  ₹{entry.total.toLocaleString("en-IN")}
                </p>
              </div>
              <p className="mt-3 break-words text-sm">
                {entry.items.map((item) => item.description).join(", ")}
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-amber-100 pt-3">
                <Link
                  className="btn-primary min-h-11 px-2 py-2"
                  to={`/entries/${entry.id}`}
                  aria-label="View transaction details"
                >
                  <Eye size={18} />
                  <span className="hidden min-[380px]:inline">View</span>
                </Link>
                <Link
                  className="btn-secondary min-h-11 py-2"
                  to={`/entries/${entry.id}/edit`}
                >
                  <Pencil size={18} />
                  {t("edit")}
                </Link>
                <button
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-50 font-semibold text-red-700"
                  onClick={() => remove(entry.id)}
                >
                  <Trash2 size={18} />
                  {t("delete")}
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="card text-center text-stone-500">
            {t("noRecords")}
          </div>
        )}
      </div>
      <div className="card hidden overflow-x-auto p-0 md:block">
        <table className="w-full min-w-[720px] text-left">
          <thead className="bg-amber-50 text-sm text-stone-600">
            <tr>
              {[
                t("date"),
                t("location"),
                t("type"),
                t("description"),
                t("amount"),
                t("actions"),
              ].map((label) => (
                <th className="px-5 py-4" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="p-6" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : data?.data.length ? (
              data.data.map((entry) => (
                <tr key={entry.id} className="border-t border-amber-100">
                  <td className="px-5 py-4">{entry.date}</td>
                  <td className="px-5 py-4">
                    {t(entry.location.toLowerCase())}
                  </td>
                  <td
                    className={`px-5 py-4 font-semibold ${entry.type === "INCOME" ? "text-green-700" : entry.type === "EXPENSE" ? "text-red-700" : "text-amber-700"}`}
                  >
                    {entry.type.replace("_", " ")}
                  </td>
                  <td className="max-w-xs px-5 py-4">
                    {entry.items.map((item) => item.description).join(", ")}
                  </td>
                  <td className="px-5 py-4 font-bold">
                    ₹{entry.total.toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <Link
                        aria-label="View transaction details"
                        className="rounded-lg bg-maroon p-3 text-white"
                        to={`/entries/${entry.id}`}
                      >
                        <Eye size={18} />
                      </Link>
                      <Link
                        aria-label="Edit"
                        className="rounded-lg bg-amber-50 p-3 text-maroon"
                        to={`/entries/${entry.id}/edit`}
                      >
                        <Pencil size={18} />
                      </Link>
                      <button
                        aria-label="Delete"
                        className="rounded-lg bg-red-50 p-3 text-red-700"
                        onClick={() => remove(entry.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-8 text-center text-stone-500" colSpan={6}>
                  {t("noRecords")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {data && (
        <div className="mt-4 flex flex-col items-center justify-between gap-3 rounded-xl border border-amber-100 bg-white p-3 sm:flex-row">
          <p className="text-sm text-stone-500">
            {data.pagination.total} records · Page {data.pagination.page} of{" "}
            {Math.max(1, data.pagination.pages)}
          </p>
          <div className="flex gap-2">
            <button
              className="btn-secondary min-h-11 px-4 py-2"
              disabled={data.pagination.page <= 1}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page - 1,
                }))
              }
            >
              Previous
            </button>
            <button
              className="btn-secondary min-h-11 px-4 py-2"
              disabled={
                data.pagination.page >= Math.max(1, data.pagination.pages)
              }
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  page: current.page + 1,
                }))
              }
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
}
