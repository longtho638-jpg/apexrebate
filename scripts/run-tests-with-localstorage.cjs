#!/usr/bin/env node

const { spawn } = require('node:child_process')
const { mkdirSync } = require('node:fs')
const path = require('node:path')

const projectRoot = process.cwd()
const storageDir = path.join(projectRoot, '.tmp')
const storageFile = path.join(storageDir, 'jest-localstorage')

mkdirSync(storageDir, { recursive: true })

const jestPkgDir = path.dirname(require.resolve('jest/package.json'))
const jestBin = path.join(jestPkgDir, 'bin', 'jest.js')
const args = ['--localstorage-file', storageFile, jestBin, ...process.argv.slice(2)]

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code) => {
  process.exit(code ?? 1)
})
