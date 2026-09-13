import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { IndianRupee, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  useCreateTransactionMutation,
  useTransactionQuery,
  useUpdateTransactionMutation,
} from "../api";
import type { EntryType, Location } from "../types";

type Form = {
  location: Location;
  type: EntryType;
  date: string;
  items: {
    description: string;
    amount?: number;
    paidTo?: string;
    notes?: string;
  }[];
};

const blank = { description: "", amount: undefined, paidTo: "", notes: "" };
const parseMoney = (text: string) => {
  const cleaned = text.replace(/,/g, "");
  if (!cleaned || cleaned === ".") return undefined;
  const number = Number(cleaned);
  return Number.isFinite(number) ? number : undefined;
};
const formatMoney = (value?: number) =>
  value === undefined || value === 0
    ? ""
    : new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(
        value,
      );

function getApiError(error: unknown) {
  if (error && typeof error === "object" && "status" in error) {
    const apiError = error as FetchBaseQueryError;
    if (apiError.status === "FETCH_ERROR")
      return "Cannot connect to the server. Please check your internet connection and try again.";
    if (apiError.status === 401)
      return "Your session has expired. Please log in again.";
    const body = apiError.data as
      | { message?: string; issues?: { message?: string }[] }
      | undefined;
    if (body?.issues?.length)
      return body.issues
        .map((issue) => issue.message)
        .filter(Boolean)
        .join(" ");
    if (body?.message) return body.message;
    return `Unable to save the entry (error ${apiError.status}). Please try again.`;
  }
  return "Something went wrong while saving. Please try again.";
}

function MoneyInput({
  value,
  onChange,
  onBlur,
}: {
  value?: number;
  onChange: (value?: number) => void;
  onBlur: () => void;
}) {
  const [display, setDisplay] = useState(() => formatMoney(value));
  useEffect(() => setDisplay(formatMoney(value)), [value]);
  const update = (text: string) => {
    const normalized = text.replace(/[^\d.]/g, "");
    const [whole = "", ...decimalParts] = normalized.split(".");
    const decimal = decimalParts.join("").slice(0, 2);
    const grouped = whole ? Number(whole).toLocaleString("en-IN") : "";
    const nextDisplay = decimalParts.length ? `${grouped}.${decimal}` : grouped;
    setDisplay(nextDisplay);
    onChange(parseMoney(nextDisplay));
  };
  return (
    <div className="relative">
      <IndianRupee
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
        size={18}
      />
      <input
        aria-label="Amount"
        className="input pl-9 text-right text-lg font-semibold tabular-nums"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={display}
        onFocus={() => {
          if (value === 0) {
            setDisplay("");
            onChange(undefined);
          }
        }}
        onChange={(event) => update(event.target.value)}
        onBlur={() => {
          setDisplay(formatMoney(parseMoney(display)));
          onBlur();
        }}
      />
    </div>
  );
}

export function EntryForm() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { data } = useTransactionQuery(id!, { skip: !id });
  const [create, { isLoading: creating }] = useCreateTransactionMutation();
  const [update, { isLoading: updating }] = useUpdateTransactionMutation();
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    control,
    watch,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({
    defaultValues: {
      location: "MANDIR",
      type: "INCOME",
      date: format(new Date(), "yyyy-MM-dd"),
      items: [blank],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const type = watch("type");
  const items = watch("items");
  useEffect(() => {
    if (data)
      reset({
        location: data.location,
        type: data.type,
        date: data.date,
        items: data.items,
      });
  }, [data, reset]);
  const total = items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  async function submit(form: Form) {
    setSubmitError("");
    const body = {
      ...form,
      items: form.items.map((item) => ({
        ...item,
        amount: Number(item.amount),
      })),
    };
    try {
      if (id) await update({ id, body }).unwrap();
      else await create(body).unwrap();
      navigate("/statement");
    } catch (error) {
      setSubmitError(getApiError(error));
    }
  }
  const busy = creating || updating;

  return (
    <form onSubmit={handleSubmit(submit)}>
      <h1 className="mb-5 text-2xl font-bold text-maroon sm:text-3xl">
        {id ? t("edit") : t("newEntry")}
      </h1>
      <div className="card grid gap-4 md:grid-cols-3">
        <div>
          <label className="label">{t("location")}</label>
          <select
            className="input"
            {...register("location", { required: "Please select a location." })}
          >
            <option value="MANDIR">{t("mandir")}</option>
            <option value="DHARAMSHALA">{t("dharamshala")}</option>
          </select>
          {errors.location && (
            <p className="mt-1 text-sm text-red-700">
              {errors.location.message}
            </p>
          )}
        </div>
        <div>
          <label className="label">{t("type")}</label>
          <select
            className="input"
            {...register("type", { required: "Please select an entry type." })}
          >
            <option value="INCOME">{t("income")}</option>
            <option value="EXPENSE">{t("expense")}</option>
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-red-700">{errors.type.message}</p>
          )}
        </div>
        <div>
          <label className="label">{t("date")}</label>
          <input
            className="input"
            type="date"
            aria-invalid={Boolean(errors.date)}
            {...register("date", { required: "Please select a date." })}
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-700">{errors.date.message}</p>
          )}
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {fields.map((field, index) => (
          <div className="card" key={field.id}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Item {index + 1}</h2>
              {fields.length > 1 && (
                <button
                  aria-label={`Remove item ${index + 1}`}
                  type="button"
                  onClick={() => remove(index)}
                  className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-700"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="label">{t("description")} *</label>
                <input
                  className="input"
                  aria-invalid={Boolean(errors.items?.[index]?.description)}
                  {...register(`items.${index}.description`, {
                    required: "Description or income source is required.",
                    maxLength: {
                      value: 200,
                      message: "Description cannot exceed 200 characters.",
                    },
                  })}
                />
                {errors.items?.[index]?.description && (
                  <p className="mt-1 text-sm text-red-700">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="label">{t("amount")} *</label>
                <Controller
                  name={`items.${index}.amount`}
                  control={control}
                  rules={{
                    required: "Amount is required.",
                    min: {
                      value: 0.01,
                      message: "Amount must be greater than zero.",
                    },
                  }}
                  render={({ field: amountField }) => (
                    <MoneyInput
                      value={amountField.value}
                      onChange={amountField.onChange}
                      onBlur={amountField.onBlur}
                    />
                  )}
                />
                {errors.items?.[index]?.amount && (
                  <p className="mt-1 text-sm text-red-700">
                    {errors.items[index]?.amount?.message}
                  </p>
                )}
              </div>
              {type === "EXPENSE" && (
                <>
                  <div>
                    <label className="label">{t("paidTo")}</label>
                    <input
                      className="input"
                      {...register(`items.${index}.paidTo`, {
                        maxLength: {
                          value: 200,
                          message: "Vendor name cannot exceed 200 characters.",
                        },
                      })}
                    />
                    {errors.items?.[index]?.paidTo && (
                      <p className="mt-1 text-sm text-red-700">
                        {errors.items[index]?.paidTo?.message}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="label">{t("notes")}</label>
                    <textarea
                      className="input"
                      rows={3}
                      {...register(`items.${index}.notes`, {
                        maxLength: {
                          value: 1000,
                          message: "Notes cannot exceed 1,000 characters.",
                        },
                      })}
                    />
                    {errors.items?.[index]?.notes && (
                      <p className="mt-1 text-sm text-red-700">
                        {errors.items[index]?.notes?.message}
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      <button
          type="button"
          onClick={() => append({ ...blank })}
          className="btn-secondary mt-4 min-h-12 w-full sm:w-auto"
        >
          <Plus />
          {t("addItem")}
        </button>
      <div className="card sticky bottom-3 z-[5] mt-5 shadow-xl sm:static sm:shadow-soft">
        {submitError && (
          <div
            role="alert"
            className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800"
          >
            {submitError}
          </div>
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-stone-500">Total</p>
            <p className="truncate text-xl font-bold tabular-nums sm:text-2xl">
              ₹{total.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
            </p>
          </div>
          <button
            className="btn-primary min-h-12 shrink-0 px-4 sm:min-w-40"
            disabled={busy}
          >
            {busy ? "Saving…" : t("save")}
          </button>
        </div>
      </div>
    </form>
  );
}
