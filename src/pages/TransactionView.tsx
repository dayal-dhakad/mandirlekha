import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Pencil,
  ReceiptText,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useTransactionQuery } from "../api";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
export function TransactionView() {
  const { id = "" } = useParams();
  const { data: transaction, isLoading, isError } = useTransactionQuery(id);
  if (isLoading) return <div className="card">Loading transaction…</div>;
  if (isError || !transaction)
    return (
      <div className="card text-red-700">Unable to load this transaction.</div>
    );
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            aria-label="Back"
            to="/statement"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-maroon shadow-soft"
          >
            <ArrowLeft />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-maroon sm:text-3xl">
              Transaction Details
            </h1>
            <p className="text-xs text-stone-500">
              Entry #{transaction.id.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>
        <Link
          className="btn-secondary min-h-11 shrink-0 px-3"
          to={`/entries/${transaction.id}/edit`}
        >
          <Pencil size={18} />
          <span className="hidden sm:inline">Edit</span>
        </Link>
      </div>
      <div className="card mb-4 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-saffron" />
          <div>
            <p className="text-xs text-stone-500">Date</p>
            <b>{transaction.date}</b>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <MapPin className="text-saffron" />
          <div>
            <p className="text-xs text-stone-500">Location</p>
            <b>
              {transaction.location === "MANDIR" ? "Mandir" : "Dharamshala"}
            </b>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ReceiptText className="text-saffron" />
          <div>
            <p className="text-xs text-stone-500">Type</p>
            <b>{transaction.type.replace("_", " ")}</b>
          </div>
        </div>
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-bold">
          Items ({transaction.items.length})
        </h2>
        {transaction.items.map((item, index) => (
          <article className="card" key={item.id || index}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-saffron">
                  ITEM {index + 1}
                </p>
                <h3 className="mt-1 break-words text-lg font-bold">
                  {item.description}
                </h3>
              </div>
              <p className="shrink-0 text-lg font-bold tabular-nums">
                {money(item.amount)}
              </p>
            </div>
            {(item.paidTo || item.notes) && (
              <div className="mt-3 space-y-2 border-t border-amber-100 pt-3 text-sm">
                {item.paidTo && (
                  <p>
                    <span className="text-stone-500">Paid to:</span>{" "}
                    {item.paidTo}
                  </p>
                )}
                {item.notes && (
                  <p className="break-words">
                    <span className="text-stone-500">Notes:</span> {item.notes}
                  </p>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="card sticky bottom-3 mt-5 flex items-center justify-between border-maroon bg-maroon text-white">
        <div>
          <p className="text-xs text-red-100">Transaction Total</p>
          <p className="text-sm">
            {transaction.items.length} item
            {transaction.items.length === 1 ? "" : "s"}
          </p>
        </div>
        <p className="text-2xl font-bold tabular-nums">
          {money(transaction.total)}
        </p>
      </div>
    </>
  );
}
