"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const fixtureRoot = path.join(root, "testdaten");
const manifest = JSON.parse(fs.readFileSync(path.join(fixtureRoot, "fixture-manifest.json"), "utf8"));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function decodePointerPart(part) {
  return part.replace(/~1/g, "/").replace(/~0/g, "~");
}

function resolveParent(document, pointer) {
  if (pointer === "") return { parent: null, key: null };
  if (!pointer.startsWith("/")) throw new Error(`Ungültiger JSON-Pointer: ${pointer}`);
  const parts = pointer.slice(1).split("/").map(decodePointerPart);
  const key = parts.pop();
  let parent = document;
  for (const part of parts) {
    const index = Array.isArray(parent) ? Number(part) : part;
    if (parent[index] === undefined) throw new Error(`Patch-Pfad fehlt: ${pointer}`);
    parent = parent[index];
  }
  return { parent, key };
}

function applyOperation(document, operation) {
  const { op, path: pointer } = operation;
  if (pointer === "") {
    if (op === "remove") throw new Error("Das Wurzeldokument darf nicht entfernt werden.");
    if (op === "add" || op === "replace") return clone(operation.value);
    throw new Error(`Nicht unterstützte Patch-Operation: ${op}`);
  }
  const { parent, key } = resolveParent(document, pointer);
  if (Array.isArray(parent)) {
    if (op === "add") {
      if (key === "-") parent.push(clone(operation.value));
      else parent.splice(Number(key), 0, clone(operation.value));
    } else if (op === "remove") {
      parent.splice(Number(key), 1);
    } else if (op === "replace") {
      parent[Number(key)] = clone(operation.value);
    } else {
      throw new Error(`Nicht unterstützte Patch-Operation: ${op}`);
    }
  } else if (op === "add" || op === "replace") {
    parent[key] = clone(operation.value);
  } else if (op === "remove") {
    if (!Object.prototype.hasOwnProperty.call(parent, key)) throw new Error(`Patch-Pfad fehlt: ${pointer}`);
    delete parent[key];
  } else {
    throw new Error(`Nicht unterstützte Patch-Operation: ${op}`);
  }
  return document;
}

function applyPatch(base, patch) {
  if (!patch || patch.format !== "nk-pro-fixture-patch/v1" || !Array.isArray(patch.operations)) {
    throw new Error("Ungültiges NK-Pro-Referenzdaten-Patchformat.");
  }
  return patch.operations.reduce((document, operation) => applyOperation(document, operation), clone(base));
}

function loadFixtureData(fixtureName) {
  const entry = manifest.fixtures[fixtureName];
  if (!entry) throw new Error(`Unbekannter Referenzfall: ${fixtureName}`);
  const base = JSON.parse(fs.readFileSync(path.join(fixtureRoot, manifest.base), "utf8"));
  if (!entry.patch) return base;
  const patch = JSON.parse(fs.readFileSync(path.join(fixtureRoot, entry.patch), "utf8"));
  if (patch.fixture !== fixtureName || patch.base !== manifest.base) {
    throw new Error(`Patchzuordnung für ${fixtureName} ist inkonsistent.`);
  }
  return applyPatch(base, patch);
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableValue(value[key])]));
  }
  return value;
}

function canonicalSha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(stableValue(value))).digest("hex");
}

module.exports = { applyPatch, canonicalSha256, loadFixtureData, manifest, root };
