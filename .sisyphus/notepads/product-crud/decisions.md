2026-04-24 16:43:30 UTC — Kept `StoreProductRequest` and `UpdateProductRequest` intentionally symmetrical so both endpoints enforce the same Product schema contract and exclude legacy fields from validation.

2026-04-24 23:44:12 Asia/Jakarta — Product CRUD routes will live under `/admin/product*` and use the exact `product.*` names expected by the frontend and `ModalDelete`. The selected-delete route uses a dedicated `/destroy-selected/{ids}` path so the comma-separated ID contract from the modal stays intact.

2026-04-24 23:55:47 — Product CRUD uses only `success` and `error` flash keys. Delete actions map FK RESTRICT violations (SQLSTATE 23000 / driver code 1451) to deterministic human-readable errors, and non-constraint database issues fall back to a generic database-error message.

2026-04-24 23:58:31 Asia/Jakarta — Preserve `ModalDelete` product mappings exactly as `product.destroy` and `product.destroySelected`; this guardrail is verification-only for Task 8, so no route-name or selected-ID serialization changes are allowed unless the component drifts from that existing contract.
