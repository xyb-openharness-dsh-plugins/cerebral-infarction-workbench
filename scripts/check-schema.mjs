import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'

const migration = readFileSync(new URL('../schema/0001_initial.sql', import.meta.url), 'utf8')
const db = new DatabaseSync(':memory:')
try {
  db.exec(migration)
  const version = db.prepare('PRAGMA user_version').get().user_version
  assert.equal(version, 1)
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok')
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), [])
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name").all().map((row) => row.name)
  assert.equal(tables.length, 11)
  assert.equal(tables.includes('public_studies'), true)
  assert.equal(tables.includes('study_source_statuses'), true)
  const acuteColumns = db.prepare('PRAGMA table_info(acute_events)').all().map((row) => row.name)
  for (const forbidden of ['diagnosis', 'risk_level', 'treatment_eligibility', 'medication_advice']) assert.equal(acuteColumns.includes(forbidden), false)

  db.prepare('INSERT INTO subjects (id,display_label,subject_role,created_at,updated_at) VALUES (?,?,?,?,?)').run('s1','演示档案','self','2026-11-19T00:00:00Z','2026-11-19T00:00:00Z')
  db.prepare("INSERT INTO acute_events (id,subject_id,state,reporter_role,assertion_status,created_at,updated_at) VALUES ('e1','s1','open','self','self_reported','2026-11-19T00:00:00Z','2026-11-19T00:00:00Z')").run()
  db.prepare("INSERT INTO event_timepoints (id,event_id,time_kind,time_value,precision,created_at) VALUES ('t1','e1','last_known_well',NULL,'unknown','2026-11-19T00:00:00Z')").run()
  assert.throws(() => db.prepare("INSERT INTO event_timepoints (id,event_id,time_kind,time_value,precision,created_at) VALUES ('t2','e1','first_observed',NULL,'exact','2026-11-19T00:00:00Z')").run(), /constraint/i)
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok')
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), [])
  console.log(`✓ schema v${version}: ${tables.length} tables; integrity_check=ok; foreign_key_check=0; forbidden acute columns=0; unknown-time constraint=pass; intentional invalid-time insert=rejected`)
} finally {
  db.close()
}
