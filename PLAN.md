# Plan: Full two-cart bidirectional sync

## Context
The app already has two independent carts, year grid with dual-language indicators, booking/delete,
and offline cache. The task requires bringing it in line with the spec:

1. **Save** — send **per-stand records** to Apps Script:
   `{ date, time, location, cartNumber, language, names:[name1,name2] }` (only filled carts).
2. **Year display** — already renders both cart indicators (single color / dual gradient). Keep + verify.
3. **Delete** — trash icon per card; send `{date,time,location,cartNumber}` to server, remove ONLY that cart;
   re-render booking/schedule/year; full clear when both carts gone.
4. **Error handling** — cache never breaks; offline works; user informed on network error.

## Changes

### google_script.txt
- `handleBooking`: add `action==="create"` branch accepting `data.bookings` array of per-cart records
  `{ date, time, location, cartNumber(1|2), language(ru|ua|de), names:[..] }`. Validate per cart, detect
  per-cart conflict, write only that cart's columns (never wipe other cart), append new slot row if none.
- `delete` branch: accept `cartNumber`; if present remove only that cart, else clear both; delete row
  only when both carts empty.
- `readAllBookings`: no change needed.

### app-sync.js
- `removeBooking(b)`: use `b.cartNumber` (1|2); clear only matching cart names; keep other cart;
  recompute year link from remaining bookings.
- Add `deleteBookingSafe` exported helper: optimistic local removal + rollback on failure (offline keeps it).
- Verify renderAllTabs re-renders year grid (keep).

### app.js
- `handleFormSubmit`: build per-cart records, POST `action=create` + `bookings` JSON; handle per-cart
  conflict/error; on success `SyncCore.addBooking` per cart.
- `deleteBooking(location,date,time,cartNumber)`: call `SyncCore.removeBooking({location,date,time,cartNumber})`
  and send `action=delete` with `cartNumber`; rollback on network failure unless offline.
- `renderScheduleBoard` cartCardHTML: 🗑️ trash icon button; pass `cartNumber`.

### index UA/DE + app-sync.css
- I18N: ensure `deleteBooking` present (already). 🗑️ emoji needs no translation.
- app-sync.css: confirm `.btn-delete-booking` styles the emoji nicely.
