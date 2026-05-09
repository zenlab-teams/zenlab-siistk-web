# ZENLAB SIISTK — Implementation Plans

Organized plan files untuk implementasi **TelatenKarya** admin dashboard.

## Plan Structure

Setiap plan memiliki folder sendiri dengan:
- **Main plan file** — implementasi utama
- **Revision files** (a, b, c, ...) — perbaikan dan enhancement
- **README.md** — overview dan status

## Plan Overview

| Plan | Feature | Status | Dependencies |
|------|---------|--------|--------------|
| [00](00/) | DataTable Component | ✅ Completed | None |
| [01](01/) | Product Thumbnail Upload | ⏳ Pending | Plan 00 |
| [02](02/) | Stock Management | ⏳ Pending | Plan 01 |
| [03](03/) | User Management | ⏳ Pending | Plan 02 |
| [04](04/) | Order Management | ⏳ Pending | Plan 03 |
| [05](05/) | Daily Dashboard | ⏳ Pending | Plan 04 |
| [06](06/) | Weekly Offers | 🔧 In Progress | Plan 05 |

## Execution Order

**Execute plans in numerical order.** Plan 00 is prerequisite for all Index pages.

## Current Status

- **Prerequisites (00):** ✅ Completed
- **Core Features (01-05):** ⏳ Pending implementation
- **Advanced Features (06):** 🔧 Implemented, needs UX fixes

## Active Issues

### Plan 06 — Weekly Offers
- ✅ Main workflow implemented
- ⏳ **Plan 06a** — Sales Reps UX consistency fix needed

## File Naming Convention

- **Main plans:** `XX-feature-name.md`
- **Revisions:** `XXa-revision-name.md`, `XXb-next-revision.md`, etc.
- **Index:** `README.md` in each folder

## Implementation Notes

- **Role:** Claude Code acts as code reviewer only
- **Migration:** Use `php artisan migrate:fresh` during development
- **Code Style:** Run `vendor/bin/pint --dirty` after PHP changes
- **Testing:** Use Pest v3 for feature tests