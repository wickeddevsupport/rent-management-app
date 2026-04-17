# Rent Management App — Mobile Admin Setup & Edit Flows v2

This doc defines the "CRUD side" of the product:
- first-time setup
- later edits
- property/room/tenant maintenance
- monthly corrections and overrides

Goal:
Keep setup and edit flows clean and easy without polluting the main collection experience.

Core principle:
**Collection mode stays simple. Admin/setup flows stay available but secondary.**

---

# Product split

The app really has 2 usage modes:

## 1. Collection mode
Used frequently.
Fast.
Minimal.
Mobile-first.

Primary flow:
Property -> Room -> Meter -> Bill -> Payment -> Done

## 2. Setup / Edit mode
Used occasionally.
Should still be easy, but can ask for more information.

Used for:
- adding properties
- adding rooms
- assigning/changing tenants
- changing rent/water/defaults
- correcting bills/payments
- archiving rooms

These flows should exist in a quieter admin layer, not in the main collection path.

---

# Design rule for CRUD/setup

## The app should never feel like raw CRUD.
Even when doing CRUD, the UI should feel task-based.

Not:
- create property
- create room
- create tenancy
- create billing cycle

Instead:
- Add property
- Add room
- Set who stays here
- Update monthly charges
- Correct payment
- Archive room

That language matters.

---

# Where setup/edit lives

## Best approach
Add a small secondary entry point, not a giant settings area.

Recommended access:
- subtle `Edit` or `Manage` action on property screen
- subtle `Edit room` action on room collection screen or room history
- optional `Setup` / `Manage` entry in profile/menu

Do NOT put complicated admin options in the main navigation.

Main nav should still stay light.

---

# First-time setup journey

## Goal
Get from zero data to usable collection flow quickly.

The first-time admin should be able to do this:
1. Add property
2. Add rooms
3. Set room defaults
4. Add current tenant per room
5. Set previous meter reading / opening due if needed
6. Start collecting

That means onboarding should feel like a guided practical checklist.

---

# First-time setup screen sequence

## Screen A — Welcome / empty state

### Purpose
Help the user start without confusion.

### Show
- simple message: no properties yet
- one clear action: `Add property`

### Avoid
- long empty-state explanations
- too many setup choices

---

## Screen B — Add property

### Purpose
Create a house/building record.

### Fields
Keep it very short:
- Property name
- Location / address
- Optional note

### Action
- `Save & add rooms`

### Principle
Do not ask for too much here.
Property creation should feel instant.

---

## Screen C — Add rooms

### Purpose
Create the room structure for that property.

## Best UX
This should allow repeated quick entry.

### Option 1 — Single room add loop
For each room:
- Room number
- Default rent
- Default water
- Electricity rate (inherit from property if possible)

After save:
- `Add another room`
- `Done`

### Option 2 — Multi-add helper
If many rooms:
- repeated small rows or chips
- add room numbers quickly one after another
- then edit details later

### Recommendation
Start simple with single-room add loop plus `Add another room`.
That is easier to understand for older/non-technical use.

---

## Screen D — Set tenant for room

### Purpose
Say who is staying there right now.

### Fields
- Tenant name
- Phone number
- Start date (BS)
- Current rent (prefilled from room default, editable)
- Current water (prefilled from room default, editable)
- Previous meter reading
- Opening due / credit if any

### Action
- `Save`

### Why this matters
This is the real setup bridge between static room config and real monthly collection.

---

# Ongoing CRUD / maintenance flows

These will happen anytime in the timeline.
The UI should support them cleanly.

---

# Flow 1 — Add a new property later

Use same property creation screen.
Short and clean.
No difference from first-time flow.

Recommended access:
- Properties screen top-right `+`
- or floating add action if it fits the visual system cleanly

---

# Flow 2 — Add a new room later

## Access
From property screen / room list:
- `Add room`

## Fields
- Room number
- Default rent
- Default water
- Electricity rate (or use property default)
- Optional note

## After save
Prompt:
- `Add tenant now`
or
- `Done`

This is important.
The system should guide the next practical step.

---

# Flow 3 — Edit room defaults

Sometimes rent/water changes over time.
This should be easy but safe.

## Access
From room screen / room history / room manage action:
- `Edit room`

## Editable fields
- Room number
- Default rent
- Default water
- Electricity rate
- Notes

## Important decision
Need to distinguish:
- changing room defaults for future months
vs
- changing this month’s actual bill

The UI should separate those clearly.

Suggested copy:
- `Default charges`
- `This month only`

That avoids accidental historical distortion.

---

# Flow 4 — Change tenant / start new tenant

This is common and should be very clean.

## Access
From room manage screen:
- `Change tenant`

## If room already occupied
Show 2-step flow:
1. End current tenant
2. Add new tenant

## End current tenant fields
- End date (BS)
- Final note optional
- Final due/settlement note optional

## New tenant fields
- Tenant name
- Phone
- Start date (BS)
- Rent
- Water
- Previous meter reading
- Opening due / credit

## Important UX rule
Make this feel like a handover, not database operations.

Not:
- end tenancy
- create tenancy

Instead:
- Previous tenant ends
- New tenant starts

---

# Flow 5 — Mark room vacant

## Access
From room manage screen:
- `Vacate room`

## What happens
- end current tenant
- room becomes vacant
- room still appears in property list, but clearly marked `Vacant`

## Why important
Vacant is not deleted.
History must remain.

---

# Flow 6 — Correct monthly bill

Mistakes happen.
Meter or payment may need correction.
This must be easy but traceable.

## Access
From room history > select month > `Edit bill`

## Editable fields
- Current reading
- Rent
- Water
- Electricity amount or units-derived amount
- Note / reason

## Important rule
Because this affects money records, this should not be too casual.
Maybe use:
- `Save changes`
- lightweight note: `Bill updated`

If needed later, include edit history. But v2 can keep this simple.

---

# Flow 7 — Correct payment

## Access
From room history or receipt:
- `Edit payment`

## Editable fields
- Amount received
- Payment method
- Date (BS visible)
- Reference/note

## Important outcome
After edit:
- due/credit recalculates
- receipt updates

## Safety rule
Payments are sensitive.
Prefer edit/reverse style behavior over deletion.

---

# Flow 8 — Add payment later without new bill

Sometimes bill exists but payment comes later.

## Access
From room screen / room history:
- `Add payment`

## Fields
- Amount
- Method
- Date
- Note/reference

## Result
- apply to unpaid balance
- show updated due/credit

This should be simpler than full collection flow because meter step is already done.

---

# Flow 9 — Archive room

Sometimes a room should disappear from normal operations without losing history.

## Access
Room manage screen:
- `Archive room`

## Behavior
- removed from main active room list
- visible in archived list only
- history preserved

## Rule
No hard delete in normal UI.
Archive instead.

---

# Flow 10 — Property defaults / rates

Some values repeat a lot and should be configurable centrally.

## Access
Property manage screen

## Fields
- default electricity rate
- optional common defaults for new rooms
- property note

## Why useful
Reduces repeated entry when setting up multiple rooms.

---

# Admin surface structure

The cleanest approach is:

## Property-level manage sheet/page
Contains:
- Edit property
- Add room
- Property defaults
- Archived rooms

## Room-level manage sheet/page
Contains:
- Edit room defaults
- Change tenant
- Vacate room
- Add payment
- View history
- Archive room

This keeps admin actions organized by context.

---

# CRUD UX principles

## 1. Prefer edit sheets/forms tied to context
Do not send users into generic back-office pages if they already know which property/room they are in.

## 2. Use progressive disclosure
Main collection screen should stay calm.
Advanced edits open only when requested.

## 3. Keep create flows short
Do not ask for every possible field upfront.
Ask only what is necessary to make the next step work.

## 4. Separate defaults from monthly actuals
This avoids major confusion.

## 5. Avoid destructive delete patterns
Use archive, vacate, or edit instead.

## 6. Show what changes will affect
Example:
- `Changes future default rent`
- `Changes this month's bill only`

This is huge for trust.

---

# Suggested first-time setup checklist

A practical setup checklist can help.

## Setup checklist
1. Add property
2. Add rooms
3. Set current tenant for each occupied room
4. Enter previous meter reading
5. Enter opening due/credit if needed
6. Start collection

This could be shown as a soft checklist after first property creation.
Not mandatory, but helpful.

---

# Good admin labels

Use:
- Add property
- Add room
- Edit room
- Change tenant
- Vacate room
- Add payment
- Edit bill
- Edit payment
- Archive room
- Default charges
- This month only

Avoid:
- CRUD language
- tenancy object language
- ledger mutation language
- billing cycle mutation language

---

# How this fits the product vision

## Main product
Fast collection.

## Support layer
Clean setup and correction flows.

The mistake to avoid is making setup/admin complexity visible all the time.
It should be available, but tucked behind contextual `Manage` / `Edit` paths.

That way:
- day-to-day users stay in the clean mobile flow
- admin tasks remain easy when needed

---

# Best final principle

**Routine actions should be visible.
Occasional actions should be accessible.
Rare actions should be hidden but available.**

That is the right balance for this app.
