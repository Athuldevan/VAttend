import type { AuthUser } from "./common.types.js";

/**
 * Adds `req.user` to Express's Request.
 *
 * This is a real module (.ts) that app.ts imports, NOT an ambient .d.ts.
 * A `.d.ts` is only applied when it happens to be part of the compiler's file
 * set; any type-checker that builds its program from an entry point and
 * follows imports — Vercel's does — never sees it, and every `req.user`
 * reference then fails with TS2339. Being in the import graph makes it apply
 * everywhere, under any program composition.
 *
 * It augments `express-serve-static-core`, which is where Express's Request
 * interface is actually declared.
 */
declare module "express-serve-static-core" {
  interface Request {
    user?: AuthUser;
  }
}

export {};
