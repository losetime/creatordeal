---
description: "Run TypeScript type check and Next.js build for Creatordeal project. Use after making code changes to verify no type errors and build succeeds."
agent: main
---

# Creatordeal Check & Build

Run TypeScript type check followed by Next.js build verification for the Creatordeal project.

## Steps

1. **TypeScript Type Check**
   ```bash
   npx tsc --noEmit 2>&1
   ```
   Working directory: `D:\creatordeal`
   Timeout: 60 seconds

2. **Next.js Build** (only if tsc passes)
   ```bash
   npx next build 2>&1
   ```
   Working directory: `D:\creatordeal`
   Timeout: 120 seconds

## Success Criteria

- TypeScript check: no errors in output
- Next.js build: "Compiled successfully" or "Route" output without errors

## Error Handling

- If tsc fails, fix type errors before building
- If build fails, check for import errors, missing dependencies, or syntax issues
- Clear `.next` cache if phantom errors occur: `Remove-Item -Recurse -Force .next`

## Notes

- This is a read-only verification workflow — no code changes
- Common pattern: run after editing files in `app/`, `components/`, `lib/`, or `hooks/`
- Project uses Next.js 16 (App Router) with TypeScript
