# Federal Budget Summarizer

A web app that uses AI (the OpenAI API) to help Americans learn about how the December 2024 federal budget impacts them based on their state of residence.

There are 2 ways to access this app:
1. I deployed the app on Railway, here: https://federal-budget-summarizer.up.railway.app/
2. You can pull this repo to run the app on localhost

I challenged myself to manually build this app from scratch to public deployment within a week. Fun!

** This project involves no AI-generated code **

### Tech stack

- Frontend: Next.js/React.js (TypeScript), Tailwind CSS, Chakra UI
- Backend: FastAPI (Python), Postgres, OpenAI API, in-memory LRU cache
- DevOps: This app is fully Dockerized: the services `api` (in `app/packages/backend/api`), `postgres` (in `app/packages/backend/db`), and `frontend` (in `app/packages/frontend`) are each wrapped in a container. I also deployed this app to Railway (a PaaS).

Since the OpenAI API doesn't have internet access, and the budget was passed after OpenAI's latest knowledge cutoff date, I tokenized the budget PDF and made embeddings with which to query the PDF.

### How to build

- Install docker
- Install the Just command runner: `$ brew install just`
- If you eventually plan to develop in this repo, install the sqlc DB querier codegen: `$ brew install sqlc`
- Rename `app/.env.tmpl` to `.env` and fill in the correct values
- In `app/`, run `$ just up` (this calls `docker-compose` with a few options)
- After the build completes, visit the app at `localhost:3000`

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
