# Client-side PDF Export & Env Var Refactor

**Date:** 2026-05-31

## Summary

Replaced `window.print()` with `html2canvas` + `jspdf` for multi-page A4 PDF export from PatientDashboard records. Added loading skeletons and error/retry states for records fetching. Fixed a hardcoded `localhost:3000` URL in DoctorDashboard dialogs by wiring it to `VITE_API_URL`.

## Key Decisions

- **html2canvas+jspdf over server-side:** Simpler, no backend changes, direct DOM capture.
- **Multi-page A4 support** with automatic page breaks for long content.
- **Skeleton loading** reused existing `Skeleton` component that was already imported but unused.
- **`useCallback` on `loadRecords`** to stabilize the fetch function reference.

## Files

- `records.tsx` — PDF export, skeletons, error/retry UI, `isDownloading` state
- `dialogs.tsx` — `localhost:3000` → `import.meta.env.VITE_API_URL`
- `.env` — added `VITE_API_URL`
- `package.json` — added `jspdf`, `html2canvas`
