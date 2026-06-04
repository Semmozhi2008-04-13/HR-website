 # ERP Stack Transition TODO

## Backend (PostgreSQL + async SQLAlchemy)
- [x] Implement `backend/backend/database.py` with asyncpg engine + `get_db` dependency.
- [x] Implement full PostgreSQL SQLAlchemy ORM models in `backend/backend/models.py` matching current UI/API payloads.
- [x] Add async startup initialization + secure seeding for empty tables.

## Backend REST API (`backend/main.py`)
- [x] Replace SQLite implementation with async SQLAlchemy session usage.
- [ ] Add Pydantic schemas and strict validations for:
  - [ ] POST `/api/jobs` (including vacancies > 0, date parsing, salary text -> NUMERIC parsing)
  - [ ] GET `/api/dashboard`
  - [ ] GET `/api/jobs`
  - [ ] GET `/api/candidates`
  - [ ] GET `/api/interviews`
  - [ ] GET `/api/evaluation`
  - [ ] GET `/api/selection`
  - [ ] PATCH `/api/selection/{id}`
  - [ ] GET `/api/offers`
- [ ] Ensure ACID transaction blocks via `async with session.begin()`.
- [ ] Ensure robust error handling (DB disconnects, validation errors).

## Frontend alignment
- [x] Refactor `cit-dashboard/src/pages/Jobmanagement.jsx` (or create alias) so it calls `apiPost` and matches backend validation.
- [ ] Update other pages only if API response shape changes.

## Testing/Run
- [ ] Update/verify `backend/requirements.txt` for async SQLAlchemy + asyncpg.
- [ ] Run FastAPI on configured port and verify endpoints.
- [ ] Run Vite and verify UI flows: create job vacancy, view lists, commit selection.

