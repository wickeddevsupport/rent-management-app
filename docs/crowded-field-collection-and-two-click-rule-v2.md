# Rent Management App — Crowded Field Collection & Two-Click Rule v2

This doc captures the real high-pressure collection scenario:

- Dad is physically collecting rent
- he reads the meter
- notes the value
- total becomes clear after meter entry
- many tenants may be around him at once
- people ask: how much, how much due, what about last month, how much now
- he takes money and writes amount received
- by the end, his diary is complete

This is the actual usage environment.
Not quiet, focused, single-task app usage.

So the app must be designed for:
- interruption
- speed
- low memory burden
- rapid switching between rooms
- clear current state
- no deep navigation
- extremely short action distance

Core rule from user:
**Nothing important should be farther than 2 clicks.**

---

# Main product correction

The app is not just a rent tracker.
It is a **field collection diary replacement**.

Paper works in that environment because:
- one glance shows the room note
- one glance shows prior info
- one line can be updated fast
- interruptions do not break the whole structure
- the collector can resume instantly

The app must preserve those strengths.

---

# Core design principle

## The app must survive interruption.

At any moment, the collector may be interrupted by:
- someone asking their total
- someone paying immediately
- someone disputing a previous due
- someone asking for a receipt
- another room calling him over

So the app must make it easy to:
- enter a reading quickly
- see the total immediately
- enter payment immediately
- jump to another room quickly
- come back without losing context

---

# The Two-Click Rule

Interpretation:

From inside a property, the collector should reach any important action in 1–2 taps.

## Important actions
- open room
- enter current reading
- see total bill
- enter amount received
- save
- jump to another room
- open next room
- resume meter round
- check a room's current due status

If these require deep navigation, the app is wrong.

---

# The right mental model

Within a property, the collector needs one operational hub.

Not many separate pages.
Not scattered actions.

He needs:
- a fast room list
- a fast meter entry path
- a fast payment entry path
- a fast way to jump between rooms

The app should feel like a notebook with live math.

---

# Best structure inside a property

## Property operational hub
Inside a selected property, the collector should immediately see:

### Top summary strip
- BS month
- total rooms
- how many still incomplete
- maybe total collected so far (optional, not dominant)

### Then two very clear routes
1. **Room list**
2. **Meter round**

But these should not become far apart worlds.
They should feel tightly connected.

---

# Better room list behavior

The room list is the central switching surface.

Every room row should show enough information that someone standing in a crowd can answer basic questions instantly.

## Each room row should show
- Room number
- Tenant name
- status
- current total or due amount
- payment state

Possible examples:
- Room 201 — Total 7,540 — Pending
- Room 202 — Total 6,200 — Partial 3,000
- Room 203 — Paid
- Room 204 — No reading yet

This lets him answer questions without opening too many screens.

---

# New important insight

## Meter entry and payment entry should not be too far apart.

Because in the real scenario, meter entry often immediately triggers a payment conversation.

That means after entering a reading, the app should not make him go through multiple screens to take payment.

Instead, it should offer a very direct continuation.

---

# Recommended interaction model

## Model: Quick room action sheet / drawer

When a room is tapped from the room list, the collector should land in a focused room panel that supports the whole conversation quickly.

This panel can be a full screen or bottom sheet depending on implementation, but behaviorally it should feel immediate.

## The room panel should include, in order:
1. Room identity
2. Meter input / current reading
3. Bill total summary
4. Payment received input
5. Save

This means one room can be completed without wandering.

---

# Why not split too much?

If meter entry is on one screen and payment is hidden deeper elsewhere, the collector will get slowed down during a crowd situation.

The app should support both cases naturally:

## Case A — Just recording meter for now
Enter current reading and leave payment blank.
Save.
Done.

## Case B — Recording meter and taking payment immediately
Enter current reading.
See total.
Enter received amount.
Save.
Done.

Same screen. Same structure.
Different amount of completion.

That is much more natural.

---

# Revised room completion model

A room does not have to be only complete or incomplete.

It may be:
1. No reading yet
2. Reading entered, payment not entered
3. Payment entered partially
4. Paid fully

This means the app should support partial completion gracefully.

---

# Meter Round mode in this reality

Meter Round mode is still useful.
But it should not feel disconnected from collection.

## Good behavior
- enter readings quickly
- save readings
- return to room list
- now totals are visible there
- tap any room from list to take payment immediately

This means Meter Round mode prepares the room list for payment conversations.

That is strong.

---

# One-screen conversation support

Imagine a tenant asks:
- how much this month?
- what about previous due?
- how much if I pay now?

The room panel should answer that immediately.

## So the bill section must be very readable
Show:
- Rent
- Water
- Electric
- Previous due
- Total

And below, if payment entered:
- Received
- Remaining due / credit

This is not extra detail.
This is conversation support.

---

# Fast-switching requirement

Since 10–20 people may be around, the collector must be able to jump between rooms fast.

## That means
- back from room should return to the same room list state
- filters/search should be preserved
- scrolling position should be preserved
- recently opened rooms should be easy to identify

If the list resets every time, the app will feel terrible.

---

# Another important insight

## The app should support incomplete progress naturally.

Because the collector may:
- enter reading for room 201
- get interrupted
- take payment for room 205
- return later to room 201

That means the system should not assume one clean sequential path.

It should visibly track progress without demanding completion in one sitting.

---

# Best status system for crowded use

Simple, strong statuses:
- No reading
- Total ready
- Partial paid
- Paid
- Vacant

This is enough.

Do not overload with too many subtle states.

---

# The "Diary replacement" design rule

A paper diary works because each room has one practical line of truth.

The digital version should mimic that clarity.

For each room, the collector should be able to get these answers quickly:
- current reading entered or not
- current total
- amount received
- remaining due

That is the digital room line.

---

# Strong recommendation: property-level operational list as primary surface

This may be the most correct model now:

## Property screen should primarily be the room list itself
Not a property summary page with extra steps.

Meaning:
- tap property
- directly see room list
- from there do everything fast

And Meter Round should be an action from that same surface, not a separate world.

Possible top bar actions:
- Meter round
- Search room
- Manage

That is likely cleaner than introducing a separate property hub screen.

---

# Two-click examples

## Example 1 — direct room collection
- Tap property
- Tap room
- enter reading / payment / save

## Example 2 — batch meter entry
- Tap property
- Tap Meter round
- enter readings / save
- return to room list
- tap room for payment

## Example 3 — tenant asks his current total
- Tap property
- see room list total already there, or tap room once if needed

No deep chains.

---

# UI implications

## The room list must become smarter, not busier.

It should expose just enough operational info to reduce taps.

For each room row, likely show:
- Room number
- Tenant name
- one main amount
- one status label

If total is ready, show total.
If payment partially entered, show remaining due.
If no reading, say `No reading`.

This makes the list conversationally useful.

---

# Save behavior in crowded use

In a crowd, hesitation kills trust.

When save is pressed, the app must:
- confirm quickly
- not wipe useful context too early
- show result clearly
- make next room easy

A good flow may be:
- Save
- small success confirmation
- `Next room` button
- `Back to rooms`

No dramatic full-screen detours unless needed.

---

# Error handling in crowded use

If save fails:
- say it clearly
- keep entered values
- allow retry immediately
- do not bounce away

Because in a crowd, losing a number once is enough to make the user abandon the app.

---

# Final product correction

The shortest accurate summary is:

## Inside a property, the room list is the center of gravity.

Everything should stay very close to it:
- meter round
- room totals
- payment progress
- room entry
- room completion

That is how the app stays natural under pressure.

---

# Final rule

## The app must be optimized for interruption-heavy real-time collection, not clean demo flows.

If it works when many people are talking at once, it will work in calm situations too.
If it only works in calm situations, it is not good enough.
