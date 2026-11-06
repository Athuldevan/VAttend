<!-- 1. Self-registration ("Create Admin" or "Create Teacher")

- Route: POST /register / /register-with-department
- Files: backend/src/apps/auth/controller/auth.controller.ts, auth.service.ts
- Anyone can sign up as either ADMIN or TEACHER and set their own password right at signup (optionally creating a brand-new department at the same time).
- No approval needed — it's public self-service. This is how the first admin/teacher accounts get into the system.

2. Admin-created Teacher ("invite" flow)

- Route: POST /users/teachers — locked down with authorize(ROLES.ADMIN), so only an existing Admin can call it.
- File: backend/src/apps/user/controller/user.controller.ts
- Admin submits just name + email + department. The backend creates the teacher with a random, unguessable password and isActive: false — so the account exists but can't log in yet.

3. Set Password (completes the invite)

- Route: POST /auth/set-password — public, no login required.
- File: backend/src/apps/auth/service/auth.service.ts
- Looks up a TEACHER with isActive: false matching the given email, lets them set a real password, and flips isActive: true.
- ⚠️ There's no token/OTP check — just an email match. Anyone who knows the invited email can claim the account. That's a real gap if teacher emails are guessable or shared.

Where "HOD" fits in

There is no HOD role or HOD-based department assignment anywhere in the code. The ROLES enum only has ADMIN, TEACHER, STUDENT. "HOD" shows up only as:
- A doc comment ("Admin / HOD") in backend/src/docs/architecture.md
- Cosmetic text in the mobile Set Password screen: "Use the email your HOD registered for you" — even though the account was actually created by an Admin, not an HOD.

So the "main difference" you're seeing is really:

┌────────────────────┬─────────────────────────────────┬─────────────────────────────┬─────────────────────────┐
│        Flow        │         Who triggers it         │       Password set by       │      Role allowed       │
├────────────────────┼─────────────────────────────────┼─────────────────────────────┼─────────────────────────┤
│ Self-register      │ Anyone (public signup)          │ The user themself,          │ Admin or Teacher        │
│                    │                                 │ immediately                 │                         │
├────────────────────┼─────────────────────────────────┼─────────────────────────────┼─────────────────────────┤
│ Admin creates      │ Admin only                      │ Nobody yet — account is     │ Teacher only            │
│ teacher            │                                 │ inactive                    │                         │
├────────────────────┼─────────────────────────────────┼─────────────────────────────┼─────────────────────────┤
│ Set Password       │ The invited teacher (public,    │ The teacher, completing the │ Activates the pending   │
│                    │ email-only)                     │  invite                     │ teacher                 │
└────────────────────┴─────────────────────────────────┴─────────────────────────────┴─────────────────────────┘

There's also dead code worth knowing about: passwordSetupCodeHash/passwordSetupExpiresAt fields exist on the User model but aren't used anywhere — looks like a token-based invite was planned but never finished, which would fix the email-only security gap in flow #3.

Want me to tighten the set-password flow with an actual token, or add a real HOD role/permission tier?

✻ Sautéed for 1m 39s

※ recap: You're exploring how user creation and password-setting work in your AMS app across Admin, Teacher, and HOD. I found there's no real HOD role, just an invite-based admin/teacher flow — let me know if you want the set-password security gap fixed. (disable recaps in /config) -->
