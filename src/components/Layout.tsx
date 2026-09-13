import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  BarChart3,
  BookOpen,
  Clock,
  LogOut,
  Menu,
  Plus,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLogoutMutation, useMeQuery } from "../api";
import { branding } from "../config";
export function Layout() {
  const [open, setOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const { data } = useMeQuery();
  const [logout] = useLogoutMutation();
  const nav = useNavigate();
  const links = [
    ["/", t("dashboard"), BarChart3],
    ["/entries/new", t("newEntry"), Plus],
    ["/statement", t("statement"), BookOpen],
    ["/exports", t("exportHistory"), Clock],
  ] as const;
  const toggle = () => {
    const next = i18n.language === "hi" ? "en" : "hi";
    i18n.changeLanguage(next);
    localStorage.setItem("language", next);
  };
  return (
    <div className="min-h-dvh">
      <aside
        className={`${open ? "translate-x-0" : "-translate-x-full"} safe-top safe-bottom fixed inset-y-0 left-0 z-30 flex h-dvh w-[min(86vw,20rem)] flex-col overflow-hidden bg-maroon text-white shadow-2xl transition-transform duration-200 lg:w-72 lg:translate-x-0 lg:shadow-none`}
      >
        <div className="flex h-20 shrink-0 items-center justify-between border-b border-white/10 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src={branding.logoUrl}
              alt="MandirLekha logo"
              className="h-12 w-12 shrink-0 object-contain"
            />
            <div className="min-w-0">
              <div className="truncate text-lg font-bold">
                {branding.appName}
              </div>
              <div className="truncate text-xs text-amber-200">
                {branding.templeName}
              </div>
            </div>
          </div>
          <button
            aria-label="Close menu"
            className="grid h-11 w-11 place-items-center rounded-xl hover:bg-white/10 lg:hidden"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-xl px-4 py-3 ${isActive ? "bg-amber-400 text-maroon" : "text-red-50 hover:bg-white/10"}`
              }
            >
              <Icon size={20} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/10 p-4">
          <button
            onClick={toggle}
            className="min-h-12 w-full rounded-xl px-4 py-3 text-left hover:bg-white/10"
          >
            🌐 {i18n.language === "hi" ? "English" : "हिन्दी"}
          </button>
          <button
            onClick={async () => {
              await logout();
              nav("/login");
            }}
            className="flex min-h-12 w-full items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/10"
          >
            <LogOut size={20} />
            {t("logout")}
          </button>
        </div>
      </aside>
      {open && (
        <button
          aria-label="Close menu overlay"
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-[1px] lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <main className="min-w-0 lg:ml-72">
        <header className="safe-top sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-amber-100 bg-cream/95 px-3 backdrop-blur sm:h-20 sm:px-8">
          <button
            aria-label="Open menu"
            className="grid h-11 w-11 place-items-center rounded-xl text-maroon hover:bg-amber-100 lg:hidden"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>
          <div className="hidden sm:block">
            <span className="text-sm text-stone-500">{t("welcome")}, </span>
            <b>{data?.owner.name}</b>
          </div>
          <div className="text-center sm:hidden">
            <p className="text-sm font-bold text-maroon">{branding.appName}</p>
            <p className="max-w-28 truncate text-[10px] text-stone-500">
              {data?.owner.name}
            </p>
          </div>
          <NavLink
            to="/entries/new"
            aria-label={t("newEntry")}
            className="btn-primary h-11 px-3 sm:px-4"
          >
            <Plus size={20} />
            <span className="hidden sm:inline">{t("newEntry")}</span>
          </NavLink>
        </header>
        <div className="mx-auto max-w-7xl p-3 pb-24 sm:p-8 sm:pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
