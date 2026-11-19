#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const version = readFileSync(join(root, 'VERSION'), 'utf8').trim()
const template = readFileSync(join(root, 'src/workbench-index.html'), 'utf8')
if (!template.includes('%VERSION%')) throw new Error('src/workbench-index.html 缺少版本注入点')
writeFileSync(join(root, 'public/index.html'), template.replaceAll('%VERSION%', version))
console.log(`✓ public/index.html（v${version}）`)
