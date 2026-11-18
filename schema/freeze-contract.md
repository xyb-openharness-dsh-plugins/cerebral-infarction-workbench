# Schema freeze contract v1

- Frozen migration: `schema/0001_initial.sql`
- User version: 1
- Freeze date: 2026-11-19
- M2 prototype confirmation: SHA-256 `26b237db5774b795d105832aef5ae8750899349bf1b176c60f8ddd7e75ded026`, user confirmed 2026-11-19 07:44 CST.
- Migration SHA-256: `2c8100c22d702d9e1eefb2f5796bb2dbac2f6026b1a7dcf254a1ed9347a32361`
- Database contract: `docs/SCHEMA.md`

Do not edit the frozen SQL. Add a new numbered migration for every later schema change. A migration requires backup/transaction/recovery coverage and a higher `PRAGMA user_version`.
