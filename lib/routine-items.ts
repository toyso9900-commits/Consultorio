import { RoutineItemType } from "@prisma/client";
import { z } from "zod";

/**
 * Shared plan-item primitives for the daily plan tracker (DPT-003).
 * Server-side source of truth for item validation; the professional editor
 * (S1b) mirrors the icon allowlist for its picker.
 */

/** Water quick-add step in ml (DPT-003). */
export const WATER_STEP_ML = 250;

/** lucide icon keys allowed on plan items; enforced server-side. */
export const ROUTINE_ITEM_ICONS = [
  "footprints",
  "droplets",
  "utensils",
  "dumbbell",
  "heart",
  "moon",
  "bike",
  "salad",
] as const;

export type RoutineItemIcon = (typeof ROUTINE_ITEM_ICONS)[number];

/**
 * One plan item as sent by the professional editor inside the publish
 * payload. `id` present = keep and update the existing item; absent =
 * create. Reconciliation is by id, never by label (DPT-009, REQ-002 MOD).
 * `sortOrder` is not part of the payload — it is the item's array index.
 *
 * Goal semantics (design): ml for WATER, meal count for AUTO_MEALS,
 * must be null for CHECK.
 */
export const routineItemInputSchema = z
  .object({
    id: z.string().min(1).optional(),
    type: z.nativeEnum(RoutineItemType),
    title: z.string().trim().min(1).max(120),
    icon: z.enum(ROUTINE_ITEM_ICONS),
    goal: z.number().int().min(1).max(100_000).nullish(),
  })
  .superRefine((item, ctx) => {
    if (item.type === RoutineItemType.CHECK && item.goal != null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["goal"],
        message: "CHECK items must not define a goal.",
      });
    }
    if (item.type !== RoutineItemType.CHECK && item.goal == null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["goal"],
        message: `${item.type} items require a positive goal.`,
      });
    }
  });

/** Publish payload: the full desired item list, capped as an abuse guard. */
export const routineItemsPayloadSchema = z
  .array(routineItemInputSchema)
  .max(20);

export type RoutineItemInput = z.infer<typeof routineItemInputSchema>;
