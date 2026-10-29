// Railway Infrastructure as Code for the federal-budget-summarizer project.
//
// This file is the source of truth for the Railway project's services and
// their deploy settings. Preview with `railway config plan` (read-only) and
// apply with `railway config apply`. Anything that exists in Railway but is
// not declared here is DELETED on apply (volumes excepted), so every service,
// database, and variable the project needs must appear below.
//
// No variable value is written here. Each service variable is an alias of the
// environment's shared variable of the same name (`ctx.shared.NAME` compiles to
// `${{shared.NAME}}`) or another resource's output (`postgres.env.DATABASE_URL`),
// so a value is edited once, in the shared variables.
//
// Docs: https://docs.railway.com/infrastructure-as-code
import { database, defineRailway, github, project, service } from "railway/iac";

const REPO = "BryanOwens012/federal-budget-summarizer";

export default defineRailway((ctx) => {
  // Only the major version of a database image is compared, so a minor bump
  // here plans nothing; upgrade within a major from the Railway dashboard.
  const postgres = database("Postgres", "postgres", {
    image: "ghcr.io/railwayapp-templates/postgres-ssl:16",
    output: "DATABASE_URL",
    defaultMountPath: "/var/lib/postgresql/data",
  });

  // Provisioned with the project but read by nothing: the API caches in memory
  // (utils/lru_cache.py). Declared so an apply does not delete it.
  const redis = database("Redis", "redis", {
    image: "railwayapp/redis:7.2.5",
    output: "REDIS_URL",
    defaultMountPath: "/bitnami",
  });

  // The FastAPI backend (app/packages/backend/api).
  const api = service("rare-bravery", {
    source: github(REPO, {
      branch: "main",
      rootDirectory: "app/packages/backend/api",
    }),
    build: {
      builder: "NIXPACKS",
      watchPatterns: ["app/packages/backend/api/**"],
    },
    networking: {
      serviceDomains: {
        "rare-bravery-production.up.railway.app": { port: 8000 },
      },
    },
    // Only the variables the API reads. A variable that is not listed is
    // deleted from the service on apply.
    env: {
      BUDGET_PDF_PATH: ctx.shared.BUDGET_PDF_PATH,
      // utils/querier.py prefers DATABASE_PUBLIC_URL and falls back to DATABASE_URL.
      DATABASE_PUBLIC_URL: postgres.env.DATABASE_PUBLIC_URL,
      DATABASE_URL: postgres.env.DATABASE_URL,
      NEXT_PUBLIC_RAILWAY_FE_URL: ctx.shared.NEXT_PUBLIC_RAILWAY_FE_URL,
      OPENAI_API_KEY: ctx.shared.OPENAI_API_KEY,
    },
  });

  // The Next.js frontend (app/packages/frontend).
  const frontend = service("federal-budget-summarizer", {
    source: github(REPO, {
      branch: "main",
      rootDirectory: "app/packages/frontend",
    }),
    build: {
      builder: "NIXPACKS",
      watchPatterns: ["app/packages/frontend/**"],
    },
    networking: {
      serviceDomains: { "federal-budget-summarizer.up.railway.app": {} },
    },
    env: {
      NEXT_PUBLIC_API_URL: ctx.shared.NEXT_PUBLIC_API_URL,
      // `next start` listens on PORT, which the public domain routes to.
      PORT: ctx.shared.PORT,
    },
  });

  // An unused service for app/packages/backend/db: no source repository, and its
  // only deploy failed. Its current settings are mirrored here so that an apply
  // leaves it untouched; deleting it is a separate, deliberate change.
  const unusedDbService = service("ravishing-kindness", {
    source: { type: "github", rootDirectory: "app/packages/backend/db" },
    build: { builder: "NIXPACKS" },
    deploy: { restartPolicyMaxRetries: 3 },
  });

  return project("federal-budget-summarizer", {
    resources: [postgres, redis, api, frontend, unusedDbService],
  });
});
