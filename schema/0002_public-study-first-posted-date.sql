-- M4 extension: preserve the registry's first-public-post date separately from last update.
-- Apply only when PRAGMA user_version = 1, inside the migration runner's transaction.
ALTER TABLE public_studies ADD COLUMN first_posted_date TEXT;
PRAGMA user_version = 2;
