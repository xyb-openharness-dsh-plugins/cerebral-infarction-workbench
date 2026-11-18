import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { createHash } from 'node:crypto'

const snapshot = JSON.parse(readFileSync(new URL('../research/clinical-trials/ctgov-ischemic-stroke-2026-11-19.json', import.meta.url), 'utf8'))
const manifest = JSON.parse(readFileSync(new URL('../research/clinical-trials/manifest.json', import.meta.url), 'utf8'))
const fixtures = JSON.parse(readFileSync(new URL('../test/fixtures/synthetic/profiles.json', import.meta.url), 'utf8'))
const first = readFileSync(new URL('../schema/0001_initial.sql', import.meta.url), 'utf8')
const next = readFileSync(new URL('../schema/0002_public-study-first-posted-date.sql', import.meta.url), 'utf8')
assert.equal(snapshot.metadata.totalCount, 331)
assert.equal(snapshot.metadata.returnedCount, snapshot.records.length)
assert.equal(manifest.snapshot.records, snapshot.records.length)
assert.equal(snapshot.metadata.complete, true)
assert.equal(new Set(snapshot.records.map((r) => r.registryId)).size, snapshot.records.length)
assert(snapshot.records.every((r) => /^NCT\d{8}$/.test(r.registryId)))
assert(snapshot.records.every((r) => /^2026-\d\d-\d\d$/.test(r.firstPostedDate) && r.firstPostedDate >= snapshot.metadata.windowStart))
assert(snapshot.records.every((r) => /^https:\/\/clinicaltrials\.gov\/study\/NCT\d{8}$/.test(r.registryUrl)))
assert(snapshot.records.every((r) => /^[a-f0-9]{64}$/.test(r.rawRecordSha256)))
const allowed = new Set(['registryId','briefTitle','studyType','recruitmentStatus','phaseText','conditionText','firstPostedDate','lastUpdatedDate','startDate','primaryCompletionDate','completionDate','registryUrl','rawRecordSha256','sourceRecordId'])
assert(snapshot.records.every((r) => Object.keys(r).every((k) => allowed.has(k))))
assert.equal(fixtures.fixtureOnly, true)
assert.equal(fixtures.subjects.length, 2)
assert(fixtures.subjects.every((s) => s.isDemo === true))
assert.equal(fixtures.subjects[0].documents.length, 1)
assert(fixtures.subjects[1].documents.length > fixtures.subjects[0].documents.length)
const db = new DatabaseSync(':memory:')
try {
  db.exec(first)
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 1)
  db.exec(next)
  assert.equal(db.prepare('PRAGMA user_version').get().user_version, 2)
  const column = db.prepare('PRAGMA table_info(public_studies)').all().find((c) => c.name === 'first_posted_date')
  assert(column)
  assert.equal(db.prepare('PRAGMA integrity_check').get().integrity_check, 'ok')
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(), [])
} finally { db.close() }
console.log(`✓ public research snapshot: ${snapshot.records.length} unique records; schema migration 1→2 adds first_posted_date; synthetic fixtures=${fixtures.subjects.length}; no participant/eligibility fields; integrity_check=ok`)
