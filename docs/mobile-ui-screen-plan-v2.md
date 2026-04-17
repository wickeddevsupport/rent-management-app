# Rent Management App — Mobile UI Screen Plan v2

This is the concrete UI planning layer built on top of `mobile-collection-user-journey-v2.md`.

Goal: define exactly what each screen should contain, what should be primary vs secondary, and how the collector moves through the product.

Design target:
- mobile first
- sleek, clean, calm
- old-person usable without feeling oversized or childish
- BS-first date system
- one-room collection flow
- minimum English dependency through strong numbers, labels, and visual structure

---

# Core navigation model

The app should feel shallow, not deep.

## Primary structure
1. Properties
2. Rooms in selected property
3. Collect for selected room
4. Success / receipt options

## Secondary / hidden structure
- Room history
- Receipts list
- Settings
- Property config / room config / overrides

These should exist, but not compete with the main flow.

---

# Global UI rules

## 1. One dominant action per screen
Each screen should make the next move obvious.

## 2. Numbers first, text second
Room numbers, amounts, meter values, and status should be faster to scan than explanatory labels.

## 3. Section separation must be clear
Use spacing, dividers, and subtle surface changes instead of clutter.

## 4. Avoid dense business UI patterns
No dashboards-first. No card explosion. No accounting terms in primary flow.

## 5. Editing should feel safe
Inputs should be obvious, live-calculated, and easy to correct before saving.

## 6. BS by default
All visible month/date references use Bikram Sambat.

---

# Screen 1 — Properties

## Purpose
Help the collector choose the right property quickly.

## User question
`Which house am I collecting from?`

## Layout

### Top bar
- Title: `Properties`
- Small current month label in BS, eg `Baisakh 2083`
- Optional profile/menu icon on far right, visually quiet

### Main content
Vertical property list.

Each property item should include:
- **Property name** — strongest text
- short location / subtitle
- compact summary row beneath:
  - `12 rooms`
  - `5 pending`
  - `7 done`
- optional due total on right if useful, but not too dominant on this screen

## Recommended visual treatment
- not giant cards
- use compact squircle tiles / rounded list blocks for tappable properties
- strong whitespace between properties
- easy tap zone but still sleek

## Interaction
- tap property → go to room list

## Secondary actions
- search icon only if many properties exist
- add/edit property hidden behind admin surface, not prominent here

## What should NOT be on this screen
- big total revenue stats
- charts
- tenant counts broken into too many dimensions
- recent activity feeds

## Priority hierarchy
1. Property name
2. Pending/done counts
3. Location subtitle
4. Optional due total

---

# Screen 2 — Rooms in Property

## Purpose
Let the collector pick the room quickly and understand collection status at a glance.

## User question
`Which room should I open now?`

## Layout

### Sticky header
- back button
- property name
- BS month label under/near title
- small summary strip:
  - total rooms
  - pending
  - done

### Filter row
Simple chips, horizontally scrollable if needed:
- All
- Pending
- Partial
- Paid
- Vacant

These should be small and sleek, not chunky.

### Room list
One vertical list item per room.

Each room row should contain:

#### Left block
- **Room number** — primary visual anchor
- tenant name below
- optional tiny subline if needed:
  - phone or vacancy label

#### Middle / status block
- one clear status chip:
  - Pending
  - Partial
  - Paid
  - Vacant

#### Right block
- key amount
  - due amount if pending/partial
  - paid indicator if done
  - blank/minimal for vacant

## Example row information
- Room 203
- Sita Gurung
- Pending
- NPR 7,540

## Interaction
- tap row → open collection screen
- long press not needed in v2

## Visual treatment
- tappable room rows can use subtle squircle containers so the target feels clear without becoming bulky

## Optional micro affordance
A subtle chevron or arrow so it's obvious the row opens.

## What the collector should understand instantly
- room identity
- whether it still needs action
- roughly how much is involved

## What should stay hidden here
- full bill breakdown
- history
- receipt actions
- detailed tenancy record

## Priority hierarchy
1. Room number
2. Amount/status
3. Tenant name
4. Secondary subtext

---

# Screen 3 — Collection Screen

## Purpose
Allow one full rent collection with minimum cognitive load.

## User question
`What do I need to enter right now for this room?`

This is the most important screen in the product.

## Overall structure
The page should be broken into 4 visual layers:
1. Room identity
2. Meter input
3. Bill summary
4. Payment entry + save

---

## 3A. Header / identity block

### Must show
- back button
- property name
- **Room number** large/prominent
- tenant name
- optional phone icon/button

### Optional small status line
- previous month unpaid / partial / credit
- only if useful, not noisy

### Visual goal
The user should immediately know:
- I am in the right room
- I know who this is

---

## 3B. Meter block

## Purpose
Ask for the one new operational input.

### Title
`Meter`

### Layout
3 fields in one clean row or stacked responsive block:
- Previous
- Current
- Units

### Behavior
- `Previous` is prefilled and read-only by default
- `Current` is the main input
- `Units` auto-calculates instantly

### Input style
- numeric keypad on focus
- large enough to type comfortably, but still sleek
- strong contrast in input border/focus state

### Error prevention
- if current < previous, show simple warning
- if current is unusually high, allow but flag gently

### Visual emphasis
`Current` input should be the hero input of the screen.

---

## 3C. Bill summary block

## Purpose
Show the collector exactly how the bill is formed.

### Title
`Bill`

### Layout
Simple stacked amount list:
- Rent
- Water
- Electric
- Previous due
- Credit used (only if present)
- Divider
- **Total**

### Amount formatting
- right aligned
- consistent number formatting
- `Total` larger/bolder

### Logic
These values update live after meter input changes.

### Important note
This section should feel like a clean invoice summary, not a table.

### Optional detail affordance
A subtle `details` or `history` link can open room history later.
Do not open by default.

---

## 3D. Payment block

## Purpose
Capture what was actually received.

### Title
`Payment`

### Layout
#### Received input
- field label: `Received`
- numeric keypad
- strong emphasis, but still secondary to current meter in task order

#### Payment method
Segmented control or pill toggle:
- Cash
- Online

#### Optional note/reference
Collapsed by default or visually secondary:
- note
- transfer reference

### Live result summary
As soon as received amount is entered, show one outcome box:
- `Remaining due` + amount
or
- `Advance credit` + amount
or
- `Paid in full`

This outcome box should be very clear.

---

## 3E. Primary action area

### Main button
`Save`

### Behavior
On tap:
- validates inputs
- saves bill + payment
- generates receipt in background
- moves to success state

### Button placement
- sticky bottom action area preferred
- always reachable on mobile

### Secondary action
Avoid clutter here.
At most:
- `Cancel`
- or back through top nav

Do not place many equal-weight buttons beside Save.

---

# Screen 4 — Success / Completion

## Purpose
Confirm completion and move the collector onward.

## User question
`Done. What next?`

## Layout
This can be a full screen or a bottom sheet.
Bottom sheet may feel faster if done cleanly.

### Content
- success icon / calm confirmation text
- Room number
- Total bill
- Received
- Remaining due / credit

### Actions
1. **Next room** — primary
2. `Receipt` — secondary
3. `Back to rooms` — tertiary

## Why this matters
The collector often needs momentum.
The product should help continue the route, not trap the user in admin detail.

---

# Screen 5 — Receipt

## Purpose
Provide a simple shareable proof/record.

## User question
`If I need to show/send the receipt, can I do it quickly?`

## Layout
Simple receipt page.

### Show
- property name
- room number
- tenant name
- BS date
- bill breakdown
- total
- received
- due / credit after payment
- payment method

### Actions
- Share
- Copy link
- Back

## Design note
This should be clean and trustworthy, but not become the center of the product.

---

# Secondary surface — Room history

## Purpose
Support follow-up questions without cluttering the main flow.

## Should include
- past months
- previous meter readings
- previous payments
- remaining dues
- notes
- receipts

## Access
From collection screen via subtle `History` link or icon.

## Must not do
Do not force users into this screen during routine collection.

---

# Summary / overview philosophy

The app still needs overview, but it should be practical rather than managerial.

## Good overview
### At property level
- rooms count
- pending count
- done count

### At room level
- room number
- tenant
- status
- amount

### At collection level
- total bill
- received
- due / credit

## Bad overview
- too many stats before action
- too much monthly accounting summary in the main route
- forcing understanding before doing

Overview should support action, not delay it.

---

# Language strategy

Because English comprehension may be slower, labels should be:
- short
- concrete
- repeated consistently
- number-led

## Preferred labels
- Properties
- Rooms
- Previous
- Current
- Units
- Rent
- Water
- Electric
- Total
- Received
- Cash
- Online
- Due
- Credit
- Save
- Next
- Receipt
- History

## Avoid in primary flow
- billing cycle
- tenancy
- payment allocation
- ledger
- reconciliation
- occupancy status if a simpler word/visual cue works

---

# Visual system guidance

## Spacing
- generous enough to separate blocks clearly
- not wasteful
- consistent vertical rhythm

## Surfaces
- use subtle cards/sections, not too many floating boxes
- one screen should feel like 3-4 sections max

## Color
- neutral base
- one accent color for actions
- restrained semantic colors:
  - red for due/problem
  - green for paid/success
  - amber for partial/warning
  - blue/neutral for informational state

## Icons
Use sparingly.
Numbers and labels should do most of the work.

## Typography
- room number and totals should be strongest
- labels smaller and quieter
- tenant name medium emphasis
- avoid too many font weights

---

# Accessibility / usability specifics

## For number entry
- numeric keypad always
- strong cursor/focus
- clear field labels that remain visible
- values should not jump visually while typing

## For older usage patterns
- predictable placement of save button
- no hidden swipe-only interactions
- no accidental auto-navigation before confirmation
- visible success state after save

## For clarity
- every screen should answer:
  - where am I?
  - what do I enter?
  - what happens next?

---

# Final build order recommendation

## Phase 1
Design and build these first:
1. Properties list
2. Room list
3. Collection screen
4. Success state

## Phase 2
Then add:
5. Receipt screen
6. Room history
7. Admin/edit/settings surfaces

This keeps the core product usable early.

---

# North star

If this UI is correct, an older collector should be able to use it without thinking in software terms.

It should feel like:
- pick place
- pick room
- enter current meter
- see total
- enter received amount
- save
- next

That is the product.