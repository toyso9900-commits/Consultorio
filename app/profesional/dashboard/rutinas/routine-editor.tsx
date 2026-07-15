"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Bike,
  ChevronDown,
  ChevronUp,
  Droplets,
  Dumbbell,
  Footprints,
  Heart,
  Loader2,
  Moon,
  Plus,
  Salad,
  Trash2,
  Utensils,
} from "lucide-react";
import { publishRoutineForPatient } from "./actions";
import { useI18n } from "@/lib/i18n/client";
import type { RoutineItemType } from "@prisma/client";
import type { RoutineItemIcon } from "@/lib/routine-items";

// Mirror of the server-side cap in lib/routine-items.ts (payload schema).
const MAX_PLAN_ITEMS = 20;
const DEFAULT_WATER_GOAL_ML = 2000;
const DEFAULT_MEALS_GOAL = 3;

export interface RoutineEditorItem {
  /** Present only for items already persisted (reconcile-by-id, REQ-002). */
  id?: string;
  type: RoutineItemType;
  title: string;
  icon: RoutineItemIcon;
  /** ml for WATER, meal count for AUTO_MEALS; always null for CHECK. */
  goal: number | null;
}

interface RoutineEditorProps {
  patientId: string;
  initialTitle: string;
  initialContent: string;
  initialItems: RoutineEditorItem[];
}

const ITEM_TYPES = [
  "CHECK",
  "WATER",
  "AUTO_MEALS",
] as const satisfies readonly RoutineItemType[];

// Type-only imports above keep @prisma/client and zod out of the client
// bundle; this map mirrors the server icon allowlist and `satisfies` turns
// any drift (missing/extra key) into a compile-time error.
const ICON_COMPONENTS = {
  footprints: Footprints,
  droplets: Droplets,
  utensils: Utensils,
  dumbbell: Dumbbell,
  heart: Heart,
  moon: Moon,
  bike: Bike,
  salad: Salad,
} satisfies Record<RoutineItemIcon, typeof Footprints>;

const ICON_KEYS = Object.keys(ICON_COMPONENTS) as RoutineItemIcon[];

const ICON_LABEL_KEYS = {
  footprints: "iconFootprints",
  droplets: "iconDroplets",
  utensils: "iconUtensils",
  dumbbell: "iconDumbbell",
  heart: "iconHeart",
  moon: "iconMoon",
  bike: "iconBike",
  salad: "iconSalad",
} as const;

const TYPE_LABEL_KEYS = {
  CHECK: "typeCheck",
  WATER: "typeWater",
  AUTO_MEALS: "typeMeals",
} as const;

function defaultGoalFor(type: RoutineItemType): number | null {
  if (type === "CHECK") return null;
  return type === "WATER" ? DEFAULT_WATER_GOAL_ML : DEFAULT_MEALS_GOAL;
}

/** Narrows a server-returned item to the editor shape (icon allowlist). */
function toEditableItem(item: {
  id: string;
  type: RoutineItemType;
  title: string;
  icon: string;
  goal: number | null;
}): RoutineEditorItem {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    icon:
      item.icon in ICON_COMPONENTS
        ? (item.icon as RoutineItemIcon)
        : "footprints",
    goal: item.goal,
  };
}

export function RoutineEditor({
  patientId,
  initialTitle,
  initialContent,
  initialItems,
}: RoutineEditorProps) {
  const { dictionary } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [items, setItems] = useState<RoutineEditorItem[]>(initialItems);

  const hasExisting = initialTitle !== "" || initialContent !== "";
  const t = dictionary.professionalRoutines;
  const limitLabel = t.itemsLimit.replace("{max}", String(MAX_PLAN_ITEMS));

  function updateItem(index: number, patch: Partial<RoutineEditorItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function changeType(index: number, type: RoutineItemType) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, type, goal: item.goal ?? defaultGoalFor(type) }
          : item
      )
    );
  }

  function addItem() {
    setItems((prev) =>
      prev.length >= MAX_PLAN_ITEMS
        ? prev
        : [
            ...prev,
            { type: "CHECK" as const, title: "", icon: "footprints" as const, goal: null },
          ]
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function moveItem(index: number, delta: -1 | 1) {
    setItems((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isPending) return;

    startTransition(async () => {
      const result = await publishRoutineForPatient(
        patientId,
        title,
        content,
        items.map((item) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          icon: item.icon,
          goal: item.type === "CHECK" ? null : item.goal,
        }))
      );
      if (result.success) {
        toast.success(t.saveSuccess);
        // Replace local state with the reconciled rows so newly created
        // items carry their real ids; re-saving without them would make the
        // server delete + recreate items and lose completion history
        // (REQ-002 MOD).
        if ("items" in result && result.items) {
          setItems(result.items.map(toEditableItem));
        }
      } else if ("errorCode" in result && result.errorCode === "not-subscribed") {
        toast.error(t.notSubscribedError);
      } else if ("errorCode" in result && result.errorCode === "invalid-items") {
        toast.error(t.invalidItemsError);
      } else {
        toast.error(result.error || t.saveError);
      }
    });
  }

  const inputClasses =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500";
  const iconButtonClasses =
    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <div>
        <label
          htmlFor={`routine-title-${patientId}`}
          className="block text-sm font-medium text-foreground"
        >
          {t.titleLabel}
        </label>
        <input
          id={`routine-title-${patientId}`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={`mt-1 ${inputClasses}`}
        />
      </div>
      <div>
        <label
          htmlFor={`routine-content-${patientId}`}
          className="block text-sm font-medium text-foreground"
        >
          {t.contentLabel}
        </label>
        <textarea
          id={`routine-content-${patientId}`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={6}
          className={`mt-1 ${inputClasses}`}
        />
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-foreground">{t.itemsTitle}</h3>

        {items.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t.itemsEmpty}</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {items.map((item, index) => (
              <li
                key={item.id ?? index}
                className="space-y-3 rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <label
                      htmlFor={`item-title-${patientId}-${index}`}
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      {t.itemTitleLabel}
                    </label>
                    <input
                      id={`item-title-${patientId}-${index}`}
                      type="text"
                      value={item.title}
                      onChange={(e) =>
                        updateItem(index, { title: e.target.value })
                      }
                      required
                      maxLength={120}
                      className={`mt-1 ${inputClasses}`}
                    />
                  </div>
                  <div className="flex items-center gap-0.5 pt-5">
                    <button
                      type="button"
                      onClick={() => moveItem(index, -1)}
                      disabled={index === 0}
                      aria-label={t.moveUp}
                      title={t.moveUp}
                      className={iconButtonClasses}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, 1)}
                      disabled={index === items.length - 1}
                      aria-label={t.moveDown}
                      title={t.moveDown}
                      className={iconButtonClasses}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      aria-label={t.removeItem}
                      title={t.removeItem}
                      className={`${iconButtonClasses} hover:text-red-600 dark:hover:text-red-400`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-end gap-3">
                  <div>
                    <label
                      htmlFor={`item-type-${patientId}-${index}`}
                      className="block text-xs font-medium text-muted-foreground"
                    >
                      {t.itemTypeLabel}
                    </label>
                    <select
                      id={`item-type-${patientId}-${index}`}
                      value={item.type}
                      onChange={(e) =>
                        changeType(index, e.target.value as RoutineItemType)
                      }
                      className={`mt-1 ${inputClasses}`}
                    >
                      {ITEM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {t[TYPE_LABEL_KEYS[type]]}
                        </option>
                      ))}
                    </select>
                  </div>

                  {item.type !== "CHECK" && (
                    <div>
                      <label
                        htmlFor={`item-goal-${patientId}-${index}`}
                        className="block text-xs font-medium text-muted-foreground"
                      >
                        {t.itemGoalLabel}
                      </label>
                      <div className="mt-1 flex items-center gap-2">
                        <input
                          id={`item-goal-${patientId}-${index}`}
                          type="number"
                          value={item.goal ?? ""}
                          onChange={(e) => {
                            const value = e.target.valueAsNumber;
                            updateItem(index, {
                              goal: Number.isNaN(value)
                                ? null
                                : Math.trunc(value),
                            });
                          }}
                          required
                          min={1}
                          max={100000}
                          step={1}
                          className={`w-28 ${inputClasses}`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {item.type === "WATER" ? t.goalUnitMl : t.goalUnitMeals}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div role="group" aria-label={t.itemIconLabel}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t.itemIconLabel}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {ICON_KEYS.map((iconKey) => {
                      const Icon = ICON_COMPONENTS[iconKey];
                      const label = t[ICON_LABEL_KEYS[iconKey]];
                      const selected = item.icon === iconKey;
                      return (
                        <button
                          key={iconKey}
                          type="button"
                          onClick={() => updateItem(index, { icon: iconKey })}
                          aria-pressed={selected}
                          aria-label={label}
                          title={label}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                            selected
                              ? "border-emerald-600 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : "border-border text-muted-foreground hover:border-emerald-500 hover:text-emerald-600"
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={addItem}
          disabled={items.length >= MAX_PLAN_ITEMS}
          title={items.length >= MAX_PLAN_ITEMS ? limitLabel : undefined}
          className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-emerald-600/50 px-4 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
        >
          <Plus className="h-4 w-4" />
          {t.addItem}
        </button>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {hasExisting ? t.updateCta : t.publishCta}
        </button>
      </div>
    </form>
  );
}
