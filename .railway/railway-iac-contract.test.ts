import { createRailwayContext, project } from "railway/iac";
import { describe, expect, it } from "vitest";
import program from "./railway.ts";

/**
 * The rule about `.railway/railway.ts` that nothing else can catch: no variable is written as a
 * value.
 *
 * Every variable is an alias of the environment's shared variable of the same name
 * (`ctx.shared.NAME`) or the same-named output of another resource (`postgres.env.DATABASE_URL`).
 * Writing the value instead replaces an alias with a copy that stops tracking what it copied, and
 * every tool renders references before printing, so the copy is indistinguishable from the alias
 * in `railway variable list`, in the Railway MCP, and in a `plan`. Nothing fails; the shared
 * variable simply stops reaching the service.
 *
 * The test evaluates the program and checks the variables it produces, so a literal cannot hide
 * behind formatting (a spread, a lowercase key, a computed name) the way it could from a text match.
 */

/**
 * Variables allowed to be something other than a same-named alias, such as `preserve()`. Empty:
 * every variable reads from the shared variables or from another resource. Add a name here only
 * for a variable that genuinely belongs to one service.
 */
const NON_ALIAS_ALLOWLIST: readonly string[] = [];

type Resource = { name: string; variables?: Record<string, unknown> };

const isSameNamedAlias = (name: string, value: unknown): boolean => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const ref = value as { type?: unknown; name?: unknown; output?: unknown };
  return (
    (ref.type === "sharedReference" && ref.name === name) ||
    (ref.type === "reference" && ref.output === name)
  );
};

describe(".railway/railway.ts references variables rather than valuing them", async () => {
  const definition = await program(
    createRailwayContext({ environment: "production" }),
    project,
  );
  const resources = (definition.resources ?? []) as Resource[];
  const entries = resources.flatMap((resource) =>
    Object.entries(resource.variables ?? {}).map(([name, value]) => ({
      resource: resource.name,
      name,
      value,
    })),
  );

  // Guards the guard: if evaluation stopped producing variables, every rule below would pass on
  // nothing.
  it("finds the variables of both app services", () => {
    const names = entries.map((e) => `${e.resource}.${e.name}`);
    expect(names).toContain("rare-bravery.OPENAI_API_KEY");
    expect(names).toContain("federal-budget-summarizer.NEXT_PUBLIC_API_URL");
  });

  it.each(entries)(
    "$resource.$name is an alias of the same name",
    ({ name, value }) => {
      if (NON_ALIAS_ALLOWLIST.includes(name)) {
        return;
      }
      expect(isSameNamedAlias(name, value), JSON.stringify(value)).toBe(true);
    },
  );
});
