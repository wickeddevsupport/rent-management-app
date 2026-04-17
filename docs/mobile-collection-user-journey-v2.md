# Rent Management App — Mobile Collection User Journey v2

## Core framing

Design for a Nepali older adult collecting rent in person on a phone.

He:
- is comfortable with familiar repeated routines
- can read English, but dense English slows him down
- trusts numbers, room numbers, amounts, and consistent visual structure more than explanatory text
- does not want to manage a system; he wants to finish a collection round accurately
- often works one room at a time while standing, walking, talking, and handling money

The app should therefore optimize for:
- one-room-at-a-time flow
- minimal typing
- clear visual separation
- obvious next action
- safe confirmation before save
- BS (Bikram Sambat) date/month display by default

---

## Main product job

Help the collector go from:

1. arriving at a property
2. selecting a room
3. entering this month's meter reading
4. seeing the bill auto-calculated
5. entering amount received
6. saving the collection

with as little cognitive load as possible.

---

## What he wants

- to quickly find the correct house
- to quickly find the correct room
- to see who is in that room
- to enter only the new meter reading
- to immediately see the total bill
- to enter how much cash/online payment was received
- to know whether anything is still due or extra
- to finish and move to the next room

## What he does not want

- dashboards with many stats before action
- accounting language everywhere
- long forms
- too many tabs/pages
- decorative cards with too much text
- needing to remember previous readings manually
- confusing edit modes
- unclear save state
- mixed date systems

---

## Primary user journey

## 0. Open app

### Screen: Home / Property list
Purpose: choose the house quickly.

### Should show
- page title: `Properties`
- search optional but not dominant
- 1 card/list item per property
- each property item shows:
  - property name
  - short location label
  - simple summary counts
    - total rooms
    - due rooms
    - collected rooms
- primary visual cue: property name and counts

### Interaction
- tap property → opens room list
- one obvious action only

### What this screen should NOT show
- large financial dashboard blocks
- unnecessary charts
- receipts/settings as primary focus

---

## 1. Choose room inside property

### Screen: Property room list
Purpose: quickly identify the next room to collect from.

### Structure
Top:
- property name
- BS month label, for example: `Baisakh 2083`
- tiny progress summary:
  - `12 rooms`
  - `5 pending`
  - `7 done`

Main list:
- one row/card per room

Each room item should show:
- room number as strongest element
- tenant name below it
- one short status chip:
  - `Pending`
  - `Paid`
  - `Vacant`
  - `Partial`
- due amount or paid amount in larger number on right
- optional tiny cue for overdue / credit

### Interaction
- tap room → opens collection screen

### Collector mindset
He should feel:
- I know exactly which room to tap
- I can tell what is left to collect today

### Avoid
- too much tenant history here
- too many stats per room
- complex color logic

---

## 2. Collect from one room

### Screen: Room collection screen
Purpose: complete one collection with minimal input.

This is the core screen.

### Header
- back
- property name
- room number (prominent)
- tenant name
- optional phone icon / short number

### Section A — Reading
Very clear, visually separated block.

Show:
- `Previous` reading
- input: `Current` reading
- calculated `Units`

Behavior:
- previous reading already filled and non-editable by default
- user enters current reading only
- units auto-calculate instantly

### Section B — Charges
Auto-calculated bill breakdown.

Show rows like:
- Rent
- Water
- Electricity
- Previous due
- Credit used (if any)
- Total

Visual rule:
- labels small and clean
- amount column aligned right
- `Total` visually strongest

### Section C — Payment
Simple entry block.

Show:
- input: `Received`
- payment method toggle:
  - Cash
  - Online
- optional note / reference as secondary

As soon as received amount is entered, show:
- `Remaining due`
or
- `Advance credit`

### Primary action
- `Save`

### After save, offer 2 next actions
- `Next room`
- `View receipt`

### What must be true on this screen
- only one main input task at a time
- no wall of text
- everything relevant visible without mental math
- summary updates live as values change

---

## 3. Save confirmation / completion

### Screen: Success state / bottom sheet / inline success
Purpose: reassure and move forward fast.

Show:
- room number
- total bill
- amount received
- remaining due or credit
- receipt action
- next room action

This should feel quick, not ceremonial.

Preferred behavior:
- lightweight confirmation screen or bottom sheet
- not a heavy separate page unless needed

---

## 4. Receipt / history (secondary)

### Screen: Receipt / room history
Purpose: supporting record, not core workflow.

Should be reachable from:
- success screen
- room details link

Should show:
- BS date
- room, tenant, property
- total bill
- amount received
- remaining due / credit
- share button

This should not interrupt collection flow unless intentionally opened.

---

## Best summary model for older collector

He does not need a business dashboard first.
He needs 3 levels of summary:

### Level 1 — Property summary
At property list:
- number of rooms
- pending count
- done count

### Level 2 — Room summary
At room list:
- room number
- tenant name
- status
- amount due / collected

### Level 3 — Room bill summary
At collection screen:
- previous reading
- current reading
- total bill
- amount received
- remaining due / credit

That is enough.

---

## Screen ideas in plain language

## Screen 1: Properties
A clean list.
Not flashy.
Just enough to choose the house.

## Screen 2: Rooms in property
A clean vertical list.
Room number leads.
Tenant secondary.
Status obvious.
Amount on right.

## Screen 3: Collect rent for room
Three clean blocks:
1. meter
2. bill
3. payment

This is the whole product.

## Screen 4: success / receipt
Short confirmation and optional share.

---

## Visual language direction

Not oversized and childish.
Not dense and admin-like.

Target feel:
- sleek
- quiet
- orderly
- confident
- high contrast where it matters
- very little decorative clutter

### UI characteristics
- strong spacing rhythm
- clear section dividers
- modest card use, not card explosion
- clean numeric alignment
- restrained accent color
- one clear primary action per screen
- status shown with both color + text, not color alone

### Typography priority
1. Room number
2. Total / due / received amount
3. Tenant name
4. Supporting labels

Numbers should read faster than text.

---

## Labels should be simpler

Prefer:
- `Previous`
- `Current`
- `Units`
- `Rent`
- `Water`
- `Electric`
- `Due`
- `Received`
- `Cash`
- `Online`
- `Save`
- `Next`

Avoid:
- billing cycle
- ledger entry
- allocation
- tenancy
- outstanding balance
- payment reconciliation

Those can exist internally, not in primary UI.

---

## BS date requirements

All visible dates/months should be BS-first.

Use BS in:
- property month header
- room collection date
- receipt date
- monthly summaries

If AD is stored internally, keep it hidden unless required.

---

## Accessibility for this specific user

Accessibility here means practical clarity, not just standards.

### Needed
- clear contrast
- readable text sizes
- stable layouts
- consistent placement of primary action
- numeric keypad for number fields
- forgiving input handling
- no accidental destructive actions
- obvious saved state

### Important interaction detail
For meter and payment fields:
- focus should bring up numeric keypad
- save button should remain easy to reach
- values should auto-format clearly

---

## Core v2 design principle

The app should answer this question at every step:

`What is the one thing I need to enter right now?`

If the answer is not obvious, the screen is too complicated.

---

## Recommended v2 screen set

1. Properties list
2. Property room list
3. Room collection screen
4. Success / receipt
5. Secondary history screen

Everything else should be hidden, merged, or demoted.

---

## Final north star

This should feel like a calm collection notebook on a phone,
not like rental management software.
