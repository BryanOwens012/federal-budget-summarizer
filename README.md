# Federal Budget Summarizer

A web app that uses AI (the OpenAI API) to help Americans learn about how the December 2024 federal budget impacts them based on their state of residence.

There are 2 ways to access this app:
1. I deployed the app on Railway, here: https://federal-budget-summarizer.up.railway.app/
2. You can pull this repo to run the app on localhost

I challenged myself to manually build this app from scratch to public deployment within a week. Fun!

** This project involves no AI-generated code, except for dependency (security) updates **

### Tech stack

- Frontend: Next.js/React.js (TypeScript), Tailwind CSS, Chakra UI
- Backend: FastAPI (Python), Postgres, OpenAI API, in-memory LRU cache
- DevOps: This app is fully Dockerized: the services `api` (in `app/packages/backend/api`), `postgres` (in `app/packages/backend/db`), and `frontend` (in `app/packages/frontend`) are each wrapped in a container. I also deployed this app to Railway (a PaaS).

Since the OpenAI API doesn't have internet access, and the budget was passed after OpenAI's latest knowledge cutoff date, I tokenized the budget PDF and made embeddings with which to query the PDF.

The chat model is never hardcoded. On the first query, the API lists the models available to its OpenAI key and picks the cheapest-looking small one (`app/packages/backend/api/utils/model_selector.py`): nano before mini before luna, then the newest major generation, then that generation's lowest point release (e.g. `gpt-5-nano`). If OpenAI later retires that model, the next call re-selects automatically. To make a new tier name eligible, add it to `TIER_PREFERENCE`. Run the selector's tests with `just test-api`.

### How to build

- Install docker
- Install the Just command runner: `$ brew install just`
- If you eventually plan to develop in this repo, install the sqlc DB querier codegen: `$ brew install sqlc`
- Rename `app/.env.tmpl` to `.env` and fill in the correct values
- In `app/`, run `$ just up` (this calls `docker-compose` with a few options)
- After the build completes, visit the app at `localhost:3000`

### Deployment (Railway)

The Railway project is Infrastructure as Code: `.railway/railway.ts` declares every service, database and variable, using the `railway/iac` DSL from the `railway` npm package. The root `package.json` exists only for this tooling; the services build from their own directories. Anything in Railway the file does not declare is deleted on apply, including each variable of a declared service.

- Service variables hold no values. Each is an alias of the environment's shared variable of the same name (`ctx.shared.NAME`) or another resource's same-named output (`postgres.env.DATABASE_URL`), so a value is edited once, in the shared variables. `.railway/railway-iac-contract.test.ts` refuses anything else.
- A shared variable must exist before an apply that aliases it, or the service receives an empty string. `plan` cannot tell: it shows `preserve() → shared.NAME` either way.
- A service declares only the variables its code reads. When code starts reading a new one, create it in the shared variables and add it to the file before deploying.
- A database image is compared by major version only; upgrade within a major from the dashboard.
- Keep `railway.json` / `railway.toml` out of service directories: one overrides these settings at build time, and `plan` refuses to manage that service.
- Applying redeploys every service whose settings changed. Agents run `plan` only; `apply` is the repo owner's.

```sh
npm install
npm run typecheck:railway
npm test
# Read-only preview; works without `railway link`
RAILWAY_PROJECT_ID=c5170fa7-f2a7-4415-8159-35c5f1a95855 RAILWAY_ENVIRONMENT_ID=224c8da9-6917-47e1-992a-b1786f5f20fe npm run railway:plan
```

### Motivation (Dec 2024)

I've been interested in law for many years. These days, I keep up with legal news (such as cases involving SCOTUS or the U.S. government), read law school textbooks, and study the Series 65 and LSAT for fun.

A week ago, as I was reading social media reactions to the new budget and discussing with people, I realized that Americans have a huge unmet need: they want to know how laws will impact them, but they either don't have the time or don't have the legal training to read the entire primary source. Secondary sources like the news media can help, but they can be suboptimal.

Indeed, the U.S.'s legal system is so complex that there are even towns where it's illegal to carry an ice cream cone in your back pocket. Luckily, those particular laws are no longer enforced, but they epitomize the issue.

Motivated to solve this need, I built this app to make legal insights more accessible.

Today, for simplicity, the app limits the user to choosing a state. Potential future roadmap:
- Allow the user to ask open-ended questions to ChatGPT via this web app intermediary
- Combine the capabilities of OpenAI API with those of BeautifulSoup (which I'm experienced in) and/or Selenium, to create AI agents that crawl the web to gather and analyze up-to-date reliable sources on hot legal topics. (The OpenAI API currently does not allow internet searches by itself. It only allows access to the pretrained information, which can be months out of date.)
- Improve the backend to be more scalable, such as by adding a Redis cache, load balancing, and parallelism
- Since the ChatGPT queries are currently the networking bottleneck, we could find ways to possibly speed up query response time, such as by caching, compressing, prefetching, prompt engineering, or fine-tuning
- Various UI/UX improvements

This was also a good opportunity to learn FastAPI (Python API framework) and the OpenAI API.
