#!/usr/bin/env node

import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const ROOT = process.cwd()

const args = process.argv.slice(2)
const directories = []
let locale = 'vi'
let customOutput

for (const arg of args) {
  if (arg.startsWith('--locale=')) {
    locale = arg.replace('--locale=', '') || locale
    continue
  }

  if (arg.startsWith('--out=')) {
    customOutput = path.isAbsolute(arg.replace('--out=', ''))
      ? arg.replace('--out=', '')
      : path.join(ROOT, arg.replace('--out=', ''))
    continue
  }

  directories.push(path.isAbsolute(arg) ? arg : path.join(ROOT, arg))
}

if (directories.length === 0) {
  directories.push(path.join(ROOT, 'src/app/(uiux-v3)'))
  directories.push(path.join(ROOT, 'src/components/uiux-v3'))
}

const outputPath = customOutput ?? path.join(ROOT, 'messages', `${locale}.uiux-v3.json`)

const DATA_ATTRIBUTE = /data-i18n=(?:"([^"]+)"|'([^']+)')/gi

function parseInlineDefaults(source) {
  const map = new Map()
  const patterns = [
    /{[^}]*?i18nKey:\s*'([^']+)'[^}]*?label:\s*'([^']+)'[^}]*?}/g,
    /{[^}]*?label:\s*'([^']+)'[^}]*?i18nKey:\s*'([^']+)'[^}]*?}/g,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(source)) !== null) {
      if (pattern === patterns[0]) {
        map.set(match[1], match[2])
      } else {
        map.set(match[2], match[1])
      }
    }
  }

  return map
}

function extractElement(source, matchIndex) {
  const openTagStart = source.lastIndexOf('<', matchIndex)
  if (openTagStart === -1) return null

  const openTagEnd = source.indexOf('>', matchIndex)
  if (openTagEnd === -1) return null

  const tagMatch = /^<([A-Za-z0-9:-]+)/.exec(source.slice(openTagStart))
  if (!tagMatch) return null

  const tagName = tagMatch[1]
  let cursor = openTagEnd + 1
  let depth = 1

  while (cursor < source.length) {
    const nextTagStart = source.indexOf('<', cursor)
    if (nextTagStart === -1) break

    if (source.startsWith(`</${tagName}`, nextTagStart)) {
      depth -= 1
      if (depth === 0) {
        return {
          inner: source.slice(openTagEnd + 1, nextTagStart),
          openTagStart,
          openTagEnd,
        }
      }
      cursor = nextTagStart + tagName.length + 3
      continue
    }

    if (source.startsWith(`<${tagName}`, nextTagStart)) {
      depth += 1
      cursor = nextTagStart + tagName.length + 1
      continue
    }

    cursor = nextTagStart + 1
  }

  return {
    inner: source.slice(openTagEnd + 1),
    openTagStart,
    openTagEnd,
  }
}

async function walk(dir, collector) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) {
        continue
      }
      await walk(fullPath, collector)
      continue
    }

    if (!entry.name.endsWith('.tsx') && !entry.name.endsWith('.jsx') && !entry.name.endsWith('.ts')) {
      continue
    }

    const content = await readFile(fullPath, 'utf8')
    const inlineDefaults = parseInlineDefaults(content)
    let match

    while ((match = DATA_ATTRIBUTE.exec(content)) !== null) {
      const key = match[1] ?? match[2]
      if (!key) continue

      const element = extractElement(content, match.index ?? 0)
      if (!element) continue

      const tagSource = content.slice(element.openTagStart, element.openTagEnd)
      const defaultAttr = /data-i18n-default=(?:"([^"]*)"|'([^']*)')/.exec(tagSource)
      const rawContent =
        defaultAttr?.[1] ??
        defaultAttr?.[2] ??
        inlineDefaults.get(key) ??
        element.inner
      const normalized = rawContent.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()

      if (!normalized) continue

      collector.push({ file: fullPath, key, value: normalized })
    }
  }
}

async function main() {
  const collected = []
  for (const directory of directories) {
    await walk(directory, collected)
  }

  const dictionary = new Map()
  const conflicts = []

  for (const entry of collected) {
    if (!dictionary.has(entry.key)) {
      dictionary.set(entry.key, entry.value)
      continue
    }

    if (dictionary.get(entry.key) !== entry.value) {
      conflicts.push(entry)
    }
  }

  if (conflicts.length > 0) {
    console.warn(`⚠️  Found ${conflicts.length} conflicting translations. Keeping first occurrence.`)
    for (const conflict of conflicts) {
      console.warn(` - ${conflict.key} (${path.relative(ROOT, conflict.file)}) -> ${conflict.value}`)
    }
  }

  const sorted = Array.from(dictionary.entries()).sort(([a], [b]) => a.localeCompare(b))
  const payload = Object.fromEntries(sorted)

  await mkdir(path.dirname(outputPath), { recursive: true })
  await writeFile(outputPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')

  console.log(`✅ Xuất ${sorted.length} khóa i18n tới ${path.relative(ROOT, outputPath)}`)
}

main().catch(error => {
  console.error('❌ Không thể xuất i18n:', error)
  process.exit(1)
})
