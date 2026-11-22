#!/usr/bin/env node
// Fails when locales/ar.json and locales/en.json do not hold the same keys, or a value is empty.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dir = new URL('../locales/', import.meta.url);
const load = (lang) => {
  const file = fileURLToPath(new URL(`${lang}.json`, dir));
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    console.error(`✗ ${lang}.json: ${error.message}`);
    process.exit(1);
  }
};

const ar = load('ar');
const en = load('en');
const problems = [];

for (const [name, own, other] of [
  ['en.json', ar, en],
  ['ar.json', en, ar],
]) {
  for (const key of Object.keys(own)) {
    if (!(key in other)) problems.push(`missing in ${name}: ${key}`);
  }
}
for (const [lang, data] of [
  ['ar', ar],
  ['en', en],
]) {
  for (const [key, value] of Object.entries(data)) {
    if (typeof value !== 'string' || value.trim() === '')
      problems.push(`empty in ${lang}.json: ${key}`);
  }
}

if (problems.length) {
  for (const line of problems) console.error(`✗ ${line}`);
  console.error(`\n${problems.length} problem(s).`);
  process.exit(1);
}
console.log(`✓ locales: ${Object.keys(ar).length} keys in ar.json and en.json`);
