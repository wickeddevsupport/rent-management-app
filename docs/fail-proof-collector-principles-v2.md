# Rent Management App — Fail-Proof Collector Principles v2

This doc is the correction layer over the previous planning docs.

The earlier docs describe a clean mobile flow.
This doc defines how the product must behave if we design for:

- a stubborn Nepali older man
- low patience for software friction
- very low tolerance for "smart" UI that behaves unexpectedly
- high need for trust, predictability, and visible control

Design target:
**If something feels confusing, delayed, hidden, or clever, he will get angry and stop trusting it.**

So the app must be built for the angry moment, not the ideal moment.

---

# The real user mindset

He is not trying to "use an app".
He is trying to finish rent collection.

He wants:
- speed
- certainty
- no surprises
- no data loss
- no hidden logic
- no accidental mistakes
- clear proof that what he entered is what got saved

He does NOT care about:
- modern UX trends
- elegant abstractions
- clever gestures
- beautiful empty states
- being taught the system

He wants the app to obey him.

---

# Core emotional rule

## The app should never make him ask:
- Where did that go?
- Did it save or not?
- Why did it change?
- What am I supposed to do now?
- Why is this hidden?
- Why is this different from before?
- Why is this asking so many things?

If the UI creates any of those questions, it is failing.

---

# Product principle

## The app must feel obedient, not intelligent.

That means:
- visible cause and effect
- stable layouts
- predictable buttons
- no disappearing controls
- no over-automation that changes values silently
- no clever shortcuts that hide the main path

The app can calculate automatically.
But it must never feel like it is doing secret things.

---

# The Angry Collector Test

Before approving any screen, ask:

## 1. If he opens this screen for 2 seconds, can he tell where he is?
If not, fail.

## 2. Can he tell the next action without reading a paragraph?
If not, fail.

## 3. If he enters one number wrong, can he immediately see and fix it?
If not, fail.

## 4. After saving, does he know for certain that it saved?
If not, fail.

## 5. If he comes back after 3 days, is the screen still obvious?
If not, fail.

## 6. If he is standing outside a room under time pressure, can he finish in under 20–30 seconds?
If not, fail.

---

# What anger actually comes from

The main anger triggers are not just visual clutter.
They are:

## 1. Unclear control
Example:
- user types something
- app changes something else
- no clear explanation

## 2. Hidden actions
Example:
- important action buried in menu
- need to discover gesture

## 3. Weak confirmation
Example:
- pressed save
- not sure if it worked

## 4. Input friction
Example:
- wrong keyboard
- too many fields
- field loses focus
- formatting jumps while typing

## 5. Broken mental model
Example:
- user thinks he is saving this month's bill
- app updates future defaults instead

## 6. Too much memory burden
Example:
- user must remember previous reading or previous due manually

## 7. Soft UI ambiguity
Example:
- tiny labels
- subtle states
- unclear difference between due and received

---

# Fail-proof design rules

## Rule 1 — Never ask for more than one new important decision at once
In collection flow, the user should not juggle:
- meter
- total
- payment
- methods
- settings
- tenant management
all at once.

Sequence matters.

Correct order:
1. confirm room
2. enter current reading
3. review bill
4. enter received amount
5. save

---

## Rule 2 — The main path must always be visible
Do not rely on:
- hidden menus
- floating surprise actions
- swipe actions
- long press
- clever context-only gestures

Core actions should be visible.

---

## Rule 3 — Inputs must look serious and stable
For numeric entry:
- field label visible at all times
- number does not jump around while typing
- no fancy animations on value change
- numeric keypad opens immediately
- input field has clear focus state

The user must feel: `I am typing into the real field.`

---

## Rule 4 — Save must feel trustworthy
After pressing save, the app must do all of these:
- show immediate loading/saving state
- prevent duplicate save taps cleanly
- show clear success confirmation
- show the final saved bill/payment summary
- make next step obvious

Never leave save ambiguous.

Bad:
- spinner disappears, nothing obvious happened

Good:
- `Saved`
- room number
- total
- received
- due/credit
- `Next room`

---

## Rule 5 — Always separate these clearly
These must never be mixed:

### A. Permanent/default values
- room default rent
- room default water
- electricity rate

### B. This month's values
- current meter reading
- this month's bill override
- this month's payment

### C. Historical values
- previous months
- previous payments

If this separation is weak, trust collapses.

---

## Rule 6 — The app should forgive mistakes
People will:
- type wrong reading
- type wrong received amount
- choose wrong room
- need to correct later

So the product must support:
- easy edit after save
- clear correction flow
- archive, not destructive deletion
- visible history

The user should never feel one mistake ruins everything.

---

## Rule 7 — No surprise navigation
After entering something, the app should not unexpectedly:
- jump to another screen
- close a sheet
- lose context
- reset the form

Only move after deliberate actions.

---

## Rule 8 — Use repetition as a feature
Older users benefit from repetition.
Every collection screen should look almost identical.
Every save flow should work the same.
Every room row should follow the same structure.

Do not over-personalize or dynamically rearrange the UI.

Consistency beats novelty.

---

# Fail-proof screen corrections

## Properties screen
What he wants:
- just show houses
- just enough summary to know where work is pending

Must be obvious:
- which property to tap
- how many rooms still need work

Should NOT have:
- overwhelming totals
- too many secondary actions

---

## Room list screen
This screen is crucial.
It is the "what's left" screen.

Each row must answer instantly:
- which room?
- who stays there?
- is it done or not?
- how much?

This means the row must prioritize:
1. room number
2. status
3. amount
4. tenant name

Not the other way around.

Reason:
when collecting in person, room number is often the fastest real-world anchor.

---

## Collection screen
This screen must feel like one straight road.

Bad feeling:
- too many inputs visible at once
- too much information weight everywhere
- unclear order

Correct feeling:
- room confirmed
- enter current
- see bill
- enter received
- save

Every section should visually say what part of the task it belongs to.

Recommended sections:
1. Room
2. Meter
3. Bill
4. Payment
5. Save

No extra noise between these blocks.

---

## Success state
Must exist.
Not optional.

Why:
Without clear success feedback, trust is weak.

Success should show:
- saved confirmation
- bill total
- amount received
- due/credit result
- next action

That is what closes the loop emotionally.

---

# Words that reduce friction

Use short, concrete words.

Prefer:
- Room
- Previous
- Current
- Units
- Rent
- Water
- Electric
- Total
- Received
- Due
- Credit
- Save
- Next
- Paid
- Pending
- Partial
- Vacant

Avoid in main flow:
- monthly billing cycle
- tenancy
- ledger
- allocation
- outstanding adjustment
- reconciliation

He should not need to decode terminology.

---

# Visual rules for trust

## 1. Strong numeric hierarchy
Amounts and readings must be easy to compare.

## 2. Clear separators
Sections must feel distinct.

## 3. Modest but strong states
Status should not rely only on color.
Use text + color.

## 4. Calm visual rhythm
No clutter, but also no ghost-like over-minimalism.
The UI should feel solid.

## 5. Important actions should look important
Save, Next room, Add room, Change tenant should be visually obvious.

---

# Offline / bad network thinking

A stubborn older user will be especially angry if the app loses work.
So long term the product should assume weak connectivity happens.

At minimum:
- input should not vanish easily
- save state should be visible
- if save fails, say clearly that it failed
- keep entered values visible so retry is easy

Bad:
- generic error
- cleared form

Good:
- `Not saved. Check connection and try again.`
- previously entered values remain there

---

# What "good" actually means here

Good does not mean stylish in the abstract.
Good means:
- impossible to misunderstand the main path
- hard to make damaging mistakes
- easy to recover from normal mistakes
- obvious whether work is complete
- stable enough that anger does not build up over time

---

# Revised product north star

The app should feel like a strict, reliable helper.

Not creative.
Not clever.
Not surprising.

It should feel like:
- choose place
- choose room
- enter one number
- see result
- enter amount
- save
- know it worked
- next

That is fail-proof.

---

# Final rule

## If a feature is elegant but can confuse an irritated older collector, reject it.

Reliability and clarity win over design cleverness every time.
