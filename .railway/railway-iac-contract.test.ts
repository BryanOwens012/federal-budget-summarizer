import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * The rule about `.railway/railway.ts` that nothing else can catch: no variable is written as a
 * value.
 *
 * Every entry is an alias of the environment's shared variable of the same name
 * (`ctx.shared.NAME`) or another resource's output (`postgres.env.DATABASE_URL`); `preserve()`,
 * which keeps whatever Railway holds, is refused unless the name is in PRESERVED_ALLOWLIST. Writing
 * the value instead replaces an alias with a copy that stops tracking what it copied, and every
 * tool renders references before printing, so the copy is indistinguishable from the alias in
 * `railway variable list`, in the Railway MCP, and in a `plan`. Nothing fails; the shared variable
 * simply stops reaching the service.
 */

const IAC_FILE = join(dirname(fileURLToPath(import.meta.url)), "railway.ts");

/**
 * Env var names are SCREAMING_SNAKE_CASE, which no other object key in that file uses. Quoted keys
 * are matched too, so `'PORT': '3000'` cannot hide from the rule below.
 */
const VARIABLE_ENTRY = /^\s*['"]?([A-Z][A-Z0-9_]*)['"]?:\s*(.+?),?\s*$/gm;

/** Another resource's output, e.g. `postgres.env.DATABASE_URL`. */
const RESOURCE_OUTPUT = /^[A-Za-z_$][\w$]*\.env\.[A-Z][A-Z0-9_]*$/;

/**
 * Variables allowed to keep a value set on the service itself with `preserve()`. Empty: every
 * service variable reads from the environment's shared variables or from another resource. Add a
 * name here only for a variable that genuinely belongs to one service.
 */
const PRESERVED_ALLOWLIST: readonly string[] = [];

describe(".railway/railway.ts references variables rather than valuing them", () => {
  // Comments quote examples like `ctx.shared.NAME` and can trail an entry; only code counts
  const code = readFileSync(IAC_FILE, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
  const entries = [...code.matchAll(VARIABLE_ENTRY)].map(([, name, value]) => ({
    name,
    value,
  }));

  // Guards the guard: an entry the regex fails to see is exempt from every rule, so each place the
  // file names a shared variable or a resource output must be one of the matched entries.
  it("sees every variable entry", () => {
    expect(entries.map((e) => e.name)).toContain("OPENAI_API_KEY");
    const references =
      code.match(/ctx\.shared\.[A-Z][A-Z0-9_]*|\b\w+\.env\.[A-Z][A-Z0-9_]*/g) ??
      [];
    const referencedByEntries = entries.filter((e) => e.value !== "preserve()");
    expect(referencedByEntries.length).toBe(references.length);
  });

  // A shared alias must name its own variable, so `FOO: ctx.shared.BAR` cannot slip through, and
  // `preserve()` hides whether a variable is an alias or a copy, so it needs an explicit exception.
  it.each(entries)(
    "$name reads from the shared variables or another resource",
    ({ name, value }) => {
      if (value === "preserve()") {
        expect(PRESERVED_ALLOWLIST).toContain(name);
      } else if (value.startsWith("ctx.shared.")) {
        expect(value).toBe(`ctx.shared.${name}`);
      } else {
        expect(value).toMatch(RESOURCE_OUTPUT);
      }
    },
  );
});
