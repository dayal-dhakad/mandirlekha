import { useState } from "react";
import { endOfMonth, format, startOfMonth, startOfWeek } from "date-fns";
import { Landmark, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useDashboardQuery } from "../api";
const iso = (d: Date) => format(d, "yyyy-MM-dd");
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);
export function Dashboard() {
  const { t } = useTranslation();
  const now = new Date();
  const [range, setRange] = useState({
    from: iso(startOfMonth(now)),
    to: iso(endOfMonth(now)),
  });
  const [activeFilter, setActiveFilter] = useState("month");
  const { data, isLoading } = useDashboardQuery(range);
  const choose = (x: string) => {
    setActiveFilter(x);
    if (x === "today") setRange({ from: iso(now), to: iso(now) });
    if (x === "week")
      setRange({
        from: iso(startOfWeek(now, { weekStartsOn: 1 })),
        to: iso(now),
      });
    if (x === "month")
      setRange({ from: iso(startOfMonth(now)), to: iso(endOfMonth(now)) });
    if (x === "year")
      setRange({
        from: `${now.getFullYear()}-01-01`,
        to: `${now.getFullYear()}-12-31`,
      });
    if (x === "all") setRange({ from: "1970-01-01", to: "9999-12-31" });
  };
  if (isLoading) return <p>Loading…</p>;
  const overall = data?.overall;
  return (
    <>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-maroon sm:text-3xl">
          {t("dashboard")}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-maroon px-3 py-1 font-semibold text-white">
            {activeFilter === "today"
              ? t("today")
              : activeFilter === "week"
                ? t("thisWeek")
                : activeFilter === "month"
                  ? t("thisMonth")
                  : activeFilter === "year"
                    ? t("thisYear")
                    : t("allTime")}
          </span>
          <span className="text-stone-500">
            {activeFilter === "all" ? (
              t("completeHistory")
            ) : (
              <>
                {format(new Date(range.from), "dd MMM yyyy")} –{" "}
                {format(new Date(range.to), "dd MMM yyyy")}
              </>
            )}
          </span>
        </div>
        <div className="-mx-3 mt-4 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {[
            ["today", t("today")],
            ["week", t("thisWeek")],
            ["month", t("thisMonth")],
            ["year", t("thisYear")],
            ["all", t("allTime")],
          ].map(([v, l]) => (
            <button
              key={v}
              onClick={() => choose(v)}
              aria-pressed={activeFilter === v}
              className={`${activeFilter === v ? "btn-primary" : "btn-secondary"} min-h-11 shrink-0 py-2`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
        {[
          [
            t("totalIncome"),
            overall?.income,
            TrendingUp,
            "text-green-700 bg-green-50",
          ],
          [
            t("totalExpense"),
            overall?.expense,
            TrendingDown,
            "text-red-700 bg-red-50",
          ],
          [t("balance"), overall?.balance, Wallet, "text-maroon bg-amber-50"],
        ].map(([label, value, Icon, color]: any) => (
          <div className="card flex items-center gap-4 md:block" key={label}>
            <div
              className={`inline-flex shrink-0 rounded-xl p-3 md:mb-4 ${color}`}
            >
              <Icon />
            </div>
            <div className="min-w-0">
              <p className="text-sm text-stone-500">{label}</p>
              <p className="mt-0.5 truncate text-xl font-bold sm:text-2xl">
                {money(value || 0)}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 md:mt-6 md:grid-cols-2">
        {(["MANDIR", "DHARAMSHALA"] as const).map((loc) => {
          const x = data?.locations[loc];
          return (
            <div className="card" key={loc}>
              <h2 className="mb-4 flex items-center gap-3 text-lg font-bold text-maroon sm:text-xl">
                <Landmark />
                {t(loc.toLowerCase())}
              </h2>
              <div className="grid gap-2 sm:grid-cols-3 sm:text-center">
                <div className="flex justify-between rounded-xl bg-green-50 p-3 sm:block sm:bg-transparent sm:p-0">
                  <p className="text-xs text-stone-500">{t("income")}</p>
                  <b className="text-green-700">{money(x?.income || 0)}</b>
                </div>
                <div className="flex justify-between rounded-xl bg-red-50 p-3 sm:block sm:bg-transparent sm:p-0">
                  <p className="text-xs text-stone-500">{t("expense")}</p>
                  <b className="text-red-700">{money(x?.expense || 0)}</b>
                </div>
                <div className="flex justify-between rounded-xl bg-amber-50 p-3 sm:block sm:bg-transparent sm:p-0">
                  <p className="text-xs text-stone-500">{t("balance")}</p>
                  <b>{money(x?.balance || 0)}</b>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

//
