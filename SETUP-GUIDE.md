# Charged Professional — Booking Page Setup Guide

There are **2 things** to finish before the online booking page works.
Both are done by editing **one file: `booking.html`**.

You don't need to know how to code. You just open the file in a text editor,
find a couple of spots, and type in your details between the quote marks.

> **How to open the file:** right-click `booking.html` → "Open With" →
> Notepad (Windows) or TextEdit (Mac). Or any code editor.
> When you're finished, just **Save** (Ctrl+S / Cmd+S).

---

## ✅ TASK 1 — Connect the form so bookings get emailed to you

Right now the booking form is built but not "plugged in" yet, so it can't
send you anything. This connects it (it's free).

**Step 1.** Go to **https://web3forms.com**

**Step 2.** In the box on their page, type your email:
`charged_detailing@outlook.com`
Then click the button to create your access key.

**Step 3.** They will **email you an Access Key**. It looks like a long code,
for example:
`a1b2c3d4-1234-5678-90ab-cdef12345678`
Copy that whole code.

**Step 4.** Open `booking.html`. Use Find (Ctrl+F / Cmd+F) and search for:
`WEB3FORMS_ACCESS_KEY`

You'll see this line:
```
const WEB3FORMS_ACCESS_KEY = "";
```

**Step 5.** Paste your key **between the two quote marks** so it looks like:
```
const WEB3FORMS_ACCESS_KEY = "a1b2c3d4-1234-5678-90ab-cdef12345678";
```

**Step 6.** Save the file. Done!

> 🔎 **Test it:** open the booking page, fill it in, and submit a test booking.
> The email arrives at `charged_detailing@outlook.com` (check your Junk folder
> the first time). Photos the customer adds come attached to that email.

---

## ✅ TASK 2 — Your availability is already set

Good news: your available days and times are **already built in** to match
your 2-week rotating shift pattern. You don't need to set this up.

For reference, this is what's been set:

**DAYS week** (your 9–5 is 06:00–16:00):
- Mon, Tue, Wed, Thu → one slot at **5pm (17:00)**
- Fri, Sat, Sun → **9am** and **1pm (13:00)**

**NIGHTS week** (your 9–5 is 16:00–02:00):
- Mon, Tue, Wed, Thu → one slot at **9am (09:00)**
- Fri, Sat, Sun → **9am** and **1pm (13:00)**

The page automatically alternates between these two weeks. The week of
**Mon 1 June 2026 is a DAYS week**, so 8 June is nights, 15 June is days,
and so on — forever. You don't have to do anything each week.

You only ever need to touch the availability for **two reasons**:

### A) To book a day OFF (holiday, or you're already booked up)
1. Open `booking.html`, search for `blockedDates`
2. Add the date(s) inside the brackets, format **"YYYY-MM-DD"**, in quotes,
   each with a comma after:
   ```
   blockedDates: [
     "2026-12-25",
     "2027-01-01",
   ],
   ```
3. Save. Those days will no longer show as available.

### B) ONLY if your real shift rotation ever slips out of sync
(For example after annual leave, you end up doing two days-weeks in a row.)
1. Open `booking.html`, search for `rotationAnchorMonday`
2. Change the date in quotes to **any Monday you KNOW is a days week**:
   ```
   rotationAnchorMonday: "2026-06-01",
   ```
3. Save. The rotation re-aligns from that Monday.

> If your weeks ever keep alternating normally, you never need to touch
> this — it stays correct on its own.

---

## Want to change your hours later?
If your slots change in future, search for `schedules:` in `booking.html`.
You'll see the `days` and `nights` blocks with each weekday
(0=Sun, 1=Mon … 6=Sat) and its times in 24-hour format, e.g.
`1: ["17:00"],` means **Monday → 5pm**. Edit the times inside the quotes,
keep the brackets and commas, and save. (Or just ask me to change them.)

---

## That's it

Once **Task 1** (the access key) is done and saved, the booking page is
fully live: customers can pick services, see your available dates, choose a
slot, add photos, and you'll get every booking by email at
`charged_detailing@outlook.com`.

Phone/WhatsApp on the site: **07709 519480**.
