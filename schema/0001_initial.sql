-- Cerebral Infarction Workbench schema v1; immutable after M3 freeze.
-- User/business facts are locally stored and must be sourced. No diagnosis field is defined.
PRAGMA foreign_keys = ON;

CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  display_label TEXT NOT NULL CHECK (length(trim(display_label)) BETWEEN 1 AND 80),
  subject_role TEXT NOT NULL CHECK (subject_role IN ('self', 'care_recipient')),
  is_demo INTEGER NOT NULL DEFAULT 0 CHECK (is_demo IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1)
) STRICT;

CREATE TABLE source_records (
  id TEXT PRIMARY KEY,
  source_kind TEXT NOT NULL CHECK (source_kind IN ('self_report', 'caregiver_report', 'document', 'synthetic_seed', 'public_reference')),
  label TEXT NOT NULL CHECK (length(trim(label)) BETWEEN 1 AND 240),
  organization TEXT,
  source_date TEXT,
  accessed_on TEXT,
  public_url TEXT,
  note TEXT,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE subject_relationships (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  actor_label TEXT NOT NULL CHECK (length(trim(actor_label)) BETWEEN 1 AND 80),
  relationship TEXT NOT NULL CHECK (relationship IN ('self', 'family', 'caregiver', 'witness', 'other')),
  access_scope TEXT NOT NULL CHECK (access_scope IN ('handoff_only', 'record_read_write')),
  confirmed_at TEXT,
  revoked_at TEXT,
  created_at TEXT NOT NULL,
  CHECK (revoked_at IS NULL OR confirmed_at IS NOT NULL)
) STRICT;
CREATE INDEX subject_relationships_subject_idx ON subject_relationships(subject_id, revoked_at);

CREATE TABLE acute_events (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  state TEXT NOT NULL CHECK (state IN ('open', 'handed_off', 'closed')),
  reporter_role TEXT NOT NULL CHECK (reporter_role IN ('self', 'caregiver', 'witness', 'unknown')),
  assertion_status TEXT NOT NULL CHECK (assertion_status IN ('self_reported', 'caregiver_reported', 'unknown')),
  source_id TEXT REFERENCES source_records(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  supersedes_id TEXT REFERENCES acute_events(id) ON DELETE RESTRICT
) STRICT;
CREATE INDEX acute_events_subject_created_idx ON acute_events(subject_id, created_at DESC);

CREATE TABLE event_timepoints (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES acute_events(id) ON DELETE RESTRICT,
  time_kind TEXT NOT NULL CHECK (time_kind IN ('last_known_well', 'first_observed')),
  time_value TEXT,
  precision TEXT NOT NULL CHECK (precision IN ('exact', 'approximate', 'date_only', 'unknown')),
  timezone TEXT,
  source_id TEXT REFERENCES source_records(id) ON DELETE RESTRICT,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  supersedes_id TEXT REFERENCES event_timepoints(id) ON DELETE RESTRICT,
  created_at TEXT NOT NULL,
  CHECK ((precision = 'unknown' AND time_value IS NULL) OR (precision <> 'unknown' AND time_value IS NOT NULL))
) STRICT;
CREATE INDEX event_timepoints_event_kind_idx ON event_timepoints(event_id, time_kind, revision DESC);

CREATE TABLE symptom_observations (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES acute_events(id) ON DELETE RESTRICT,
  sign_key TEXT NOT NULL CHECK (sign_key IN ('face', 'arm', 'speech', 'balance', 'vision', 'other')),
  observation_state TEXT NOT NULL CHECK (observation_state IN ('present', 'not_observed', 'unknown')),
  observed_at TEXT,
  reporter_role TEXT NOT NULL CHECK (reporter_role IN ('self', 'caregiver', 'witness', 'unknown')),
  source_id TEXT REFERENCES source_records(id) ON DELETE RESTRICT,
  note TEXT CHECK (note IS NULL OR length(note) <= 2000),
  assertion_status TEXT NOT NULL CHECK (assertion_status IN ('self_reported', 'caregiver_reported', 'copied_from_document', 'unknown')),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  supersedes_id TEXT REFERENCES symptom_observations(id) ON DELETE RESTRICT,
  is_private INTEGER NOT NULL DEFAULT 0 CHECK (is_private IN (0, 1)),
  created_at TEXT NOT NULL
) STRICT;
CREATE INDEX symptom_observations_event_idx ON symptom_observations(event_id, created_at);

CREATE TABLE clinical_documents (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  document_kind TEXT NOT NULL CHECK (document_kind IN ('visit_note', 'discharge_summary', 'imaging_report', 'laboratory_report', 'other')),
  display_label TEXT NOT NULL CHECK (length(trim(display_label)) BETWEEN 1 AND 240),
  document_date TEXT,
  relative_path TEXT NOT NULL CHECK (length(relative_path) BETWEEN 1 AND 1024 AND substr(relative_path, 1, 1) <> '/' AND instr(relative_path, '..') = 0),
  sha256 TEXT CHECK (sha256 IS NULL OR length(sha256) = 64),
  media_type TEXT,
  source_id TEXT REFERENCES source_records(id) ON DELETE RESTRICT,
  review_state TEXT NOT NULL DEFAULT 'unreviewed' CHECK (review_state IN ('unreviewed', 'transcribed', 'user_confirmed')),
  assertion_status TEXT NOT NULL DEFAULT 'unknown' CHECK (assertion_status IN ('copied_from_document', 'user_reported', 'clinician_confirmed', 'unknown')),
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  supersedes_id TEXT REFERENCES clinical_documents(id) ON DELETE RESTRICT,
  is_private INTEGER NOT NULL DEFAULT 0 CHECK (is_private IN (0, 1)),
  in_use INTEGER NOT NULL DEFAULT 1 CHECK (in_use IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;
CREATE INDEX clinical_documents_subject_date_idx ON clinical_documents(subject_id, document_date DESC);

CREATE TABLE care_questions (
  id TEXT PRIMARY KEY,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
  question_text TEXT NOT NULL CHECK (length(trim(question_text)) BETWEEN 1 AND 4000),
  state TEXT NOT NULL CHECK (state IN ('draft', 'open', 'asked', 'retired')),
  source_id TEXT REFERENCES source_records(id) ON DELETE RESTRICT,
  revision INTEGER NOT NULL DEFAULT 1 CHECK (revision >= 1),
  supersedes_id TEXT REFERENCES care_questions(id) ON DELETE RESTRICT,
  is_private INTEGER NOT NULL DEFAULT 0 CHECK (is_private IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;
CREATE INDEX care_questions_subject_state_idx ON care_questions(subject_id, state, updated_at DESC);

CREATE TABLE public_studies (
  registry_id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES source_records(id) ON DELETE RESTRICT,
  brief_title TEXT NOT NULL,
  study_type TEXT,
  recruitment_status TEXT,
  phase_text TEXT,
  condition_text TEXT,
  country_codes TEXT NOT NULL DEFAULT '',
  start_date TEXT,
  completion_date TEXT,
  results_posted_at TEXT,
  record_updated_at TEXT,
  snapshot_date TEXT NOT NULL,
  registry_url TEXT NOT NULL,
  raw_record_sha256 TEXT NOT NULL CHECK (length(raw_record_sha256) = 64)
) STRICT;
CREATE INDEX public_studies_status_phase_idx ON public_studies(recruitment_status, phase_text);
CREATE INDEX public_studies_condition_idx ON public_studies(condition_text);

CREATE TABLE study_source_statuses (
  id TEXT PRIMARY KEY,
  query_key TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES source_records(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('ok', 'empty', 'failed', 'not_queried')),
  fetched_at TEXT,
  record_count INTEGER CHECK (record_count IS NULL OR record_count >= 0),
  detail TEXT,
  UNIQUE(query_key, source_id)
) STRICT;

CREATE TABLE workbench_settings (
  setting_key TEXT PRIMARY KEY CHECK (setting_key IN ('data_directory_status', 'reference_pack_version', 'large_text')),
  setting_value TEXT NOT NULL CHECK (length(setting_value) <= 500),
  updated_at TEXT NOT NULL
) STRICT;

PRAGMA user_version = 1;
