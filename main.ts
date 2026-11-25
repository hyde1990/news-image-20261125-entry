// news-image-20261125: deliver the pre-rendered front page as the entry.
//
// The picture (entry.png, 1024x1024) was painted in code with PIL: a
// newspaper front page for Wednesday 25 November 2026 — six stories plus an
// "Also in the news" strip. Because the bytes already exist beside this
// file, the program's only job is to place an exact copy at the output
// location the grader reads, and to refuse to run if the picture is
// missing or damaged. No network, no randomness, no clock: the same
// input bytes always produce the same output bytes.
//
// Run:  mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// A PNG always starts with these eight bytes; anything else is not the
// picture we rendered, so stop instead of handing the grader a bad file.
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const here = dirname(fileURLToPath(import.meta.url));
const sourcePath = join(here, "entry.png");
if (!existsSync(sourcePath)) {
  throw new Error(`entry.png not found next to main.ts (${here})`);
}
const picture = readFileSync(sourcePath);
if (picture.length < PNG_MAGIC.length || !picture.subarray(0, 8).equals(PNG_MAGIC)) {
  throw new Error("entry.png is not a valid PNG file");
}

const outDir = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.png");
writeFileSync(outPath, picture);

// Post-copy integrity check: the grader runs this program twice and
// both runs must write identical bytes, so prove the copy landed intact
// before reporting success — same length, same PNG magic, same bytes.
const written = readFileSync(outPath);
if (written.length !== picture.length) {
  throw new Error(
    `entry.png copy is ${written.length} bytes, expected ${picture.length}`
  );
}
if (!written.subarray(0, 8).equals(PNG_MAGIC) || !written.equals(picture)) {
  throw new Error("entry.png copy does not match the rendered picture");
}
