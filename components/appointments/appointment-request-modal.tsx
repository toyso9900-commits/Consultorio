"use client";

import { useState, useTransition } from "react";
import { Calendar, Clock, FileText, X } from "lucide-react";
import { requestAppointment } from "@/app/paciente/dashboard/appointment-actions";
import type { RequestAppointmentResult } from "@/app/paciente/dashboard/appointment-actions";
import type { Dictionary } from "@/lib/i18n/dictionaries";

interface AppointmentRequestModalProps {
  professionalId: string;
  professionalName: string;
  locale: string;
  dictionary: Dictionary;
}

export function AppointmentRequestModal({
  professionalId,
  professionalName,
  dictionary,
}: AppointmentRequestModalProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<RequestAppointmentResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const formData = new FormData(event.currentTarget);
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const notes = (formData.get("notes") as string) || undefined;

    const scheduledAt = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduledAt.getTime())) {
      setResult({ success: false, error: "La fecha y hora no son válidas." });
      return;
    }

    if (scheduledAt.getTime() <= Date.now()) {
      setResult({
        success: false,
        error: dictionary.appointments.errors.pastDate,
      });
      return;
    }

    startTransition(async () => {
      const response = await requestAppointment({
        professionalId,
        scheduledAt: scheduledAt.toISOString(),
        notes,
      });
      setResult(response);
      if (response.success) {
        setOpen(false);
        event.currentTarget.reset();
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 sm:flex-none"
      >
        <Calendar className="h-4 w-4" />
        {dictionary.appointments.request.submit}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {dictionary.appointments.request.title}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              {professionalName}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label
                    htmlFor="appointment-date"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {dictionary.appointments.request.date}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="appointment-date"
                      name="date"
                      type="date"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="appointment-time"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {dictionary.appointments.request.time}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      id="appointment-time"
                      name="time"
                      type="time"
                      required
                      className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="appointment-notes"
                  className="text-sm font-medium text-slate-700 dark:text-slate-300"
                >
                  {dictionary.appointments.request.notes}
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    id="appointment-notes"
                    name="notes"
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    placeholder={dictionary.appointments.request.notesHint}
                  />
                </div>
              </div>

              {result && !result.success && (
                <p className="text-sm text-rose-600 dark:text-rose-400">{result.error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  {dictionary.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
                >
                  {isPending
                    ? dictionary.appointments.request.submitting
                    : dictionary.appointments.request.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
