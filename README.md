# Lightbox — Pixabay Media Search

A single-page site (plain HTML/CSS/JS, no frameworks) for searching Pixabay's
photo and video library. Includes a free-text search bar with a photo/video
toggle, and four one-click "quick pull" buttons (Rocket Launch, Basketball,
Forest, Road Forest).

## Why Netlify

This is a static site with no backend server, so there's nowhere to hide an
API key from the network the way a server-side proxy would. To still satisfy
"key kept out of source code," the key is generated into `config.js` **at
deploy time** from an environment variable, instead of being committed to
the repo. GitHub Pages can't do this (it only serves whatever's in the repo
verbatim), so this project uses **Netlify's free tier**, which supports
build commands and environment variables. Netlify deploys straight from your
GitHub repo, so you still keep GitHub as your source of truth.

## Project structure

```
index.html          the page
style.css            styling
script.js            search, challenge buttons, fetch calls, rendering
config.sample.js     committed template — placeholder key only
config.js            YOUR real key — gitignored, you create this locally
.gitignore           excludes config.js
netlify.toml         tells Netlify how to generate config.js at build time
```

## Running it locally

1. Clone the repo.
2. Copy the sample config and add your real key:
   ```
   cp config.sample.js config.js
   ```
   Then open `config.js` and replace `YOUR_API_KEY_HERE` with a real key from
   [pixabay.com/api/docs](https://pixabay.com/api/docs/) (free account required).
3. Open `index.html` directly in a browser, or serve the folder with any
   static server, e.g.:
   ```
   npx serve .
   ```
   (A local server isn't strictly required for this project — fetch to
   Pixabay works fine from a file:// page too, but `npx serve` avoids any
   browser quirks with local files.)

`config.js` stays on your machine only — it's listed in `.gitignore`, so
`git status` should never show it as a tracked or staged file.

## Deploying to Netlify

1. Push this repo to GitHub (commit everything **except** `config.js` —
   Git will skip it automatically thanks to `.gitignore`).
2. Create a free account at [netlify.com](https://www.netlify.com).
3. **Add a new site → Import an existing project → GitHub**, and pick this
   repository.
4. Build settings are already defined in `netlify.toml`, so you shouldn't
   need to change anything in the UI. Confirm:
   - Build command: `echo "const PIXABAY_API_KEY = '$PIXABAY_API_KEY';" > config.js`
   - Publish directory: `.`
5. Before the first deploy, go to **Site configuration → Environment
   variables** and add:
   - Key: `PIXABAY_API_KEY`
   - Value: your real Pixabay key
6. Trigger a deploy. Netlify will run the build command, which writes a
   fresh `config.js` containing your key into the deployed output only —
   it's never written back into your git history.
7. Netlify gives you a live URL (something like
   `https://your-site-name.netlify.app`) — that's your live link.

Any time you push new commits to GitHub, Netlify rebuilds and redeploys
automatically, regenerating `config.js` from the same environment variable.

## A note on key exposure

Because this is a 100%-client-side site, the key is still visible to anyone
who opens the browser's network tab while using the live site — that's true
of *any* purely static site that calls a key-based API directly. What this
setup does guarantee is that the key:
- is never committed to git or visible in the repository history,
- is never visible in the source files you'd share or push publicly,
- can be rotated instantly from the Netlify dashboard without touching code.

A fully hidden key would require routing requests through a backend/serverless
proxy instead of calling Pixabay directly from the browser.

## Assumptions made

- Media type isn't specified per challenge in the brief, so three challenges
  (Rocket Launch, Basketball, Forest) search **photos**, and one (Road
  Forest) searches **videos**, so both code paths are demonstrated.
- Each search (bar or challenge button) returns up to 16 results.
- `safesearch=true` is applied to all requests.
