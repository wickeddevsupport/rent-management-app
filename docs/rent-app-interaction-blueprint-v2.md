# Rent App — Interaction Blueprint v2

Goal: turn the planning layer into a build-ready interaction blueprint that developers can implement without guesswork. This document defines exact behaviors, component responsibilities, screen vs sheet decisions, state model, and error/retry rules. It is intentionally prescriptive so the implementation is deterministic and testable.

---

## Design goals (reminder)
- Operate inside a property with minimal friction. The room list is the center of gravity.
- Support two first-class modes: Direct Collection (room-first) and Meter Round (batch readings-first).
- Survive interruption-heavy, noisy, crowd conditions. Nothing important should be more than 1–2 taps away.
- Preserve the simplicity of the paper diary; be predictable and obvious.

---

## Surface map and navigation decisions
- Tap property → Room list (primary surface). No intermediate property hub required.
- From Room list:
  - Tap a room → opens Room Panel (bottom sheet by default on mobile, full-screen on tablet/desktop or if user taps "Open fully").
  - Tap Meter round → opens Meter Round screen (ordered list input).
- Back/close from Room Panel returns to the room list and preserves scroll, filters, and selected filter chip.
- Recent rooms (last 5 opened) are visually flagged in the list and accessible via a small quick-jump area at top of list (optional).

---

## Room list — exact row anatomy and behavior
Row structure (left → middle → right):
- Left (squircle): Room number (large), tenant name (small)
- Middle: Status chip (No reading / Total ready / Partial / Paid / Vacant)
- Right: Main amount text (if total ready/partial) or subtle placeholder ("No reading")

Interaction rules:
- Single tap: open Room Panel (bottom sheet)
- Long press: not used
- Chevron or squircle highlight indicates tap target
- Row should be accessible (44–48px tappable height minimum)

Visual rules:
- Use squircle containers for the room number area and for property tiles
- Status chips use clear color-coded semantics (green=Paid, amber=Partial, red=Pending, gray=No reading)

Data shown on rows:
- Primary amount follows priority: (1) Remaining due if partial, (2) Total if ready, (3) — for no reading show "No reading"

Preservation:
- Scrolling position, filters, and search must persist when returning from a Room Panel or Meter Round.

---

## Room Panel (bottom sheet) — exact layout & interactions
Purpose: single working surface for the noisy field conversation — meter entry, bill preview, payment entry, save.

Layout order and elements (top → bottom):
1. Header (sticky within sheet): Back/close, Room number, Tenant name, small status
2. Meter entry row:
   - Previous (read-only), Current (numeric input), Units (calculated)
   - Current should show numeric keypad and accept fast entry. Input masks: integers only by default with optional decimal if the meter uses it.
3. Bill summary (live calculated): Rent, Water, Electric, Previous due, Discounts, Total
   - Totals update live when Current changes
4. Payment entry:
   - Received (numeric), Payment method dropdown (Cash / Bank / Other), optional quick-buttons for common amounts (Exact, Half, Custom)
   - If Received > Total, show change/credit immediately
5. Actions row (sticky bottom of sheet): Save / Next room
   - Save commits current state; Next room moves focus to the next visible room in the room list (preserves sheet open and scrolls to next)

Primary interaction patterns:
- Case A (meter-only): enter Current → Save (leave Received blank)
- Case B (meter + payment): enter Current → Received → Save
- After Save show short success toast with undo option ("Saved — Undo") for 6–10s
- If user presses Next room, advance to next row in list and move sheet focus there (auto-scroll if needed). Next is optional but expected in crowded flow

Warnings & validation:
- If Current < Previous → show inline, blocking warning with two choices: "Edit" (re-focus input) or "Save anyway" (requires a second confirm press)
- If delta (Current - Previous) exceeds configurable threshold (e.g., > 3x typical usage or > X units) → non-blocking warn and flag row for review

Accessibility:
- All fields have labels and are reachable via keyboard; focus management returns to current input if validation fails

---

## Meter Round — exact behaviors
- Single ordered list representing the collector's physical route. Order defined by room order value; fallback to room number.
- Each row shows: Room number, Previous, Current input, saved/unsaved marker
- Input mode supports rapid entry: on pressing Enter or Next, focus moves to next Current field (auto-advance optional; require toggle in settings)

Save model (hybrid recommended):
- Local autosave draft while typing (debounced 1s)
- Visible per-row local-draft indicator (•) while unsaved
- Global "Save readings" button to persist server-side. During server save, lock the Save button and indicate progress
- On successful server save, each row shows saved tick and timestamp

Failure behavior:
- If server save fails, keep drafts, show persistent banner with retry action, and allow offline-stored drafts to be retried later
- Do NOT clear drafts on navigation or crash

After save:
- Return to Room list where rows now show "Total ready" as appropriate
- Optionally show a small success summary: "8 of 12 readings saved"

---

## State model (single source-of-truth)
RoomMonthState (per room / per billing month):
- NO_READING
- READING_CAPTURED (reading saved; bill not necessarily paid)
- BILL_READY (bill generated; unpaid)
- PARTIAL_PAID (payment recorded but remaining due exists)
- PAID
- VACANT

State transitions must be explicit and idempotent on server side. Client should never infer irreversible transitions without server confirmation.

---

## Save / network / retry rules
- All user actions should preserve input locally before any network call
- Optimistic UI allowed for row-level saves with clear rollback path if server rejects (show error and restore previous UI state)
- Always show an unobtrusive persistent indicator if the app is offline and there are unsynced drafts
- On failed save: keep inputs, show clear error, expose Retry (single tap) and Export/Copy (to external diary as fallback)
- Provide Undo toast after save (6–10s) that reverts last change locally and sends delete/rollback to server when possible

---

## Error prevention and helpful defaults
- Input masks and numeric keypad for meter and payment fields
- Debounced inline validation on Current (1s) and Received (on blur)
- Prevent accidental destructive actions with confirmation and undo
- Provide clear copy for errors: what failed + how to fix

---

## Screen vs sheet decision rules
- Use bottom sheet for Room Panel on mobile for fast context-preserving edits and quick return to list
- Use full-screen room page on large screens or when user selects "Open fully"
- Meter Round should be full-screen (it is a dedicated batch task)

---

## Two-click rule mapping (testable checks)
From within a property:
- Open room & enter reading = 2 taps (property → room → start input counts as one tap to open then typing)
- Enter reading + take payment = 2 taps to surface (property → room) + inputs (typing) + 1 tap Save
- View any room's total = 1 tap (room list) or 2 taps (open room) depending on whether list shows totals

Acceptance criteria for implementation:
- All important actions reachable within 2 taps from property (room list as anchor)
- Returning from a room preserves scroll, filter, and selection state
- Autosave drafts persist across app restarts/session interruptions

---

## Instrumentation & analytics (minimal) — what to track
- Tap counts to common flows (time to Save per room)
- Unsave retries & save failures
- Validation warnings frequency (Current < Previous, large jumps)
- Meter round save counts and failure rates

---

## Developer handoff checklist (what to implement first)
1. Room list component + row UI (squircles, chips, amount priority)
2. Room Panel bottom sheet with meter input, live bill summary, payment entry, Save/Next
3. Meter Round screen with hybrid save model (autosave drafts + Save readings)
4. State transitions and server API contracts (idempotent saves, rollback, unread flags)
5. Offline draft store + retry queue
6. Basic analytics events
7. Accessibility and keyboard focus flows

---

## Next step
Produce mocks/prototype for Room Panel and Meter Round (Figma or HTML prototype), then implement the order above. After implementation, run a short field test (10–20 rooms, realistic interruptions) and iterate on problem areas.





