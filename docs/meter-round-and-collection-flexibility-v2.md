# Rent Management App — Meter Round & Collection Flexibility v2

This doc addresses a critical real-world behavior:

The collector does **not always** work room-by-room from start to finish.
Sometimes he:
1. goes to the place where multiple meters are lined up
2. writes all current meter readings first
3. then later calculates / collects room by room

In the described case:
- around 24 rooms are involved
- the collector may move through multiple physical meter spots
- room numbers are directly tied to the meters, so that is enough structure
- he already has a paper method that works and avoids mistakes

So the app must **adapt to his proven working method**, not force a single rigid flow.

---

# Key product correction

The app cannot have only one workflow.
It needs **2 valid collection workflows**:

## Workflow A — Room-by-room collection
Best when:
- he is directly visiting a room
- meter and payment happen together
- he wants immediate bill + payment + done

Flow:
Property -> Room -> Current reading -> Bill -> Received -> Save

## Workflow B — Meter round first, collection later
Best when:
- he wants to record many readings quickly
- he prefers to calculate later room by room
- this mirrors his paper workflow
- room numbers already identify the meter order well enough

Flow:
Property -> Meter round -> Enter all current readings -> Save readings -> Later open each room for payment/collection

This is not edge-case behavior.
This is core.

---

# Design principle

## The app should respect the user's natural sequence of work.

If paper is reliable because it matches his physical route and thinking pattern, the app should copy that advantage.

That means:
- preserve physical order
- support batch reading entry
- do not force payment entry at the same time
- let readings be captured first and completed later

---

# The right conceptual model

The app should support 2 different tasks:

## Task 1 — Capture readings
Just record meter values safely and quickly.

## Task 2 — Complete collection
Review bill, enter payment, finish room.

These tasks are connected, but not identical.

---

# New product concept: Meter Round mode

A dedicated mode for reading collection.

This is **not** a spreadsheet.
It is a controlled batch entry pad.

---

# Meter Round mode — What it should do

## Primary job
Let the collector walk the meter route and enter many current readings rapidly with minimal thinking.

## It should show
- property name
- BS month label
- one stable ordered list of rooms
- previous reading for each room
- one field for current reading
- completion state

## It should NOT ask for
- payment
- notes by default
- bill breakdown on every row
- tenant management
- advanced edits

Those belong later.

---

# Why this matters

Paper works because:
- all relevant rooms are visible in one place
- the order matches physical reality
- only one thing is recorded: current reading
- completion is obvious
- there is little mode-switching

The app should preserve those advantages.

---

# Product correction: no meter-area categorization needed

Even if the collector physically checks meters in a few different spots, the app does not need to model those spots as categories if room numbers already map cleanly to the meters.

That means:
- no Meter Area A / B / C abstraction
- no extra grouping UI
- no extra setup burden

Instead, the app should use a single stable meter-round list ordered by room number or by whatever fixed meter order matches reality best.

That keeps the workflow simpler and avoids inventing structure that the user does not need.

---

# New screen: Meter Round Entry

## Purpose
Capture current readings for many rooms quickly.

## Core idea
A single stable, ordered list of rooms matching the practical meter-checking order.

## Each row should show
- Room number
- Previous reading
- Current reading input
- simple status marker

Optionally show tenant name smaller if helpful, but room number is primary.

## Row anatomy
### Left
- Room 201
- optional tenant small/subtle

### Middle
- Previous: 1245

### Right
- Current input field

### Status
- blank / entered / saved

---

# Behavior rules for Meter Round mode

## 1. Order must be stable
Rooms should appear in the same order as the physical meters.

This is very important.
The app should not reorder dynamically by due amount, tenant name, or status if that breaks physical memory.

## 2. Only one main input per row
Current reading.
Nothing else should compete.

## 3. Auto-advance should help but not surprise
Possible behavior:
- after entering a reading and tapping next, focus moves to next row

But it should remain predictable and easy to control.

## 4. Previous reading always visible
So he can compare quickly and catch mistakes.

## 5. Unfilled rows must remain obvious
So he can instantly see what is left.

---

# Mistake prevention in Meter Round mode

Since he says paper never causes mistakes, the app must not introduce new ones.

## Must-have protections

### A. Previous vs current sanity check
If current < previous:
- show clear warning
- do not silently accept without notice

### B. Large jump warning
If usage spike is unusually high:
- allow save
- but flag row for review

### C. Save without losing list state
If connection fails, the list should remain intact.

### D. Explicit saved state
Each row or the whole list must clearly show what is saved.

### E. Easy correction
Tap row again, edit current reading, save again.

---

# Save model for Meter Round mode

There are 2 good options.

## Option 1 — Row save
Each entered reading saves immediately.

Pros:
- low loss risk
- reassuring if well designed

Cons:
- too much save noise if not done carefully

## Option 2 — Batch save
Enter multiple rows, then press `Save readings`

Pros:
- closer to paper rhythm
- faster in one pass

Cons:
- greater risk if network/save fails

## Recommended hybrid
- autosave draft locally while typing
- explicit `Save readings` button for confidence
- clear saved indicator after success

That gives both safety and control.

---

# After Meter Round save

The app should not force immediate payment entry.

Instead show:
- `Readings saved`
- `Review rooms`
- `Continue later`
- maybe `Start collection`

This keeps the workflows separate and natural.

---

# How Meter Round connects to room collection

Once readings are saved, the room list changes meaningfully.

Each room can now show:
- bill ready
- payment pending

That means on the room list we may need states like:
- No reading yet
- Bill ready
- Partial payment
- Paid

This is much more realistic than only pending/paid.

---

# Revised room state model

For actual field usage, rooms may be in one of these states for the month:

1. No reading yet
2. Reading captured
3. Bill ready / unpaid
4. Partially paid
5. Paid
6. Vacant

This better supports both workflows.

---

# Suggested user journey with flexibility

## Route A — fast direct collection
1. Property
2. Room
3. Enter current reading
4. See bill
5. Enter received
6. Save

## Route B — meter round first
1. Property
2. Meter round
3. Enter all current readings
4. Save readings
5. Open rooms one by one later
6. Enter received
7. Save

The app should support both without making either feel secondary.

---

# UI recommendation

## Property screen should have 2 primary task entries
Not as giant buttons, but clearly available:
- Rooms
- Meter round

That allows the user to choose based on what he is doing physically.

Alternative wording could be:
- Collect by room
- Enter meter readings

This may be even clearer.

No extra meter-area selection should exist unless a real future need appears.

---

# How to keep it fail-proof

If designing for a stubborn older collector, Meter Round mode must obey these rules:

## 1. Same order every time
No surprise reorder.

## 2. One number at a time
No clutter.

## 3. Previous reading always visible
Trust through comparison.

## 4. Clear unsaved vs saved state
No ambiguity.

## 5. Completion should be countable
Example:
- 5 of 8 entered

## 6. Easy resume
If he stops midway, he can return and continue where he left off.

## 7. No forced switch into payment mode
Because that breaks his real workflow.

---

# Setup implications

To support this properly, setup/edit flows may need only one optional concept:

## Room setup may include
- meter order (only if room number order is not enough)

In the simpler version, room number itself is enough and no extra meter metadata is needed.

That is preferable unless reality proves otherwise.

---

# Product insight

This is the real lesson:

The app should not just digitize rent accounting.
It should digitize the collector's field routine.

That routine currently includes:
- batch meter capture
- stable physical order
- delayed calculation/payment completion

If we respect that, the app becomes natural.
If we ignore that, the app will always feel worse than paper.

---

# Final recommendation

The v2 app should support both:
- **Collection mode**
- **Meter Round mode**

And Meter Round mode should be treated as a first-class workflow, not a hidden extra.

That is how we accommodate flexibility without losing clarity.
