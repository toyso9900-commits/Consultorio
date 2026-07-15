# Delta for Personalized Routine

## ADDED Requirements

### Requirement: REQ-006 Author plan items on a routine (S1)

The system SHALL allow a professional to manage plan items (label, icon, kind CHECK | WATER | AUTO_MEALS, optional target, sort order) on routines they own, only for patients holding an active subscription. The system MUST reject plan-item writes targeting another professional's routine or a non-subscribed patient.

#### Scenario: Professional authors items for a subscriber

- GIVEN Juan has an ACTIVE subscription to Laura and a routine exists for the pair
- WHEN Laura saves plan items (e.g. "Caminar 30 min" CHECK, "Agua 2000 ml" WATER, "3 comidas" AUTO_MEALS)
- THEN the items persist attached to the (Juan, Laura) routine

#### Scenario: Authoring rejected for non-subscriber

- GIVEN Ana has no active subscription to Laura
- WHEN Laura attempts to save plan items for Ana
- THEN the action is rejected with a "patient not subscribed" error
- AND no plan items are created

#### Scenario: Cross-professional authoring rejected

- GIVEN a routine owned by professional Pedro
- WHEN Laura attempts to add or edit plan items on Pedro's routine
- THEN the action is rejected with an authorization error

### Requirement: REQ-007 Patient page renders the real plan tracker (S1)

The patient routine page SHALL render, per routine card, the routine's authored plan items with their live completion state, replacing the hardcoded placeholder rows. The static FREE section (REQ-005) and the REQ-004 gating MUST remain unchanged.

#### Scenario: Subscriber sees authored items

- GIVEN Juan subscribes to Laura and her routine has 3 authored items
- WHEN Juan opens `/paciente/dashboard/rutina`
- THEN the routine card shows those 3 items with today's completion state
- AND no hardcoded walk/water/meals placeholder rows render

#### Scenario: Routine without items renders empty tracker

- GIVEN a routine with no plan items
- WHEN Juan opens the routine page
- THEN the plan section shows an empty state, not placeholder rows

## MODIFIED Requirements

### Requirement: REQ-002 Edit an existing routine

The system SHALL allow the authoring professional to update the title, content, and plan items of an existing routine for a subscribed patient, replacing the routine in place via upsert. The upsert MUST preserve the routine id and MUST preserve unchanged plan-item ids (items are reconciled by id, not label), so completion history stays linked.

(Previously: only title and content were replaced in place; plan items did not exist.)

#### Scenario: Professional updates routine content

- GIVEN a routine "Plan Semana 1" exists for (Juan, Laura)
- WHEN Laura edits the content to "Plan Semana 2" and saves
- THEN the stored routine reflects the new title and content
- AND only one `Routine` row exists for the pair

#### Scenario: Routine edit preserves plan items and history

- GIVEN the routine has plan items with patient completion history
- WHEN Laura edits the routine title/content without removing items
- THEN the same item ids survive the upsert
- AND existing completion rows remain linked to their items
