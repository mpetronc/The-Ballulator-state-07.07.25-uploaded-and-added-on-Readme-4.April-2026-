# Ballulator

Ballulator is a basketball stat comparison web app built with React and Vite.

You can log game-by-game stats, build running averages, and get matched with:
- realistic NBA player comps for lower-output stat lines
- all-time player comps for stronger profiles
- a `G O A T` label for unrealistic, incomparable averages

## Features

- Game stat entry and saved local history
- Running averages across multiple box scores
- NBA and all-time player comparison logic
- Milestone tracking for 5 core profile areas
- Empty-state and low-stat fallback logic

## GitHub Pages

After pushing the latest changes to `main`, Ballulator deploys through GitHub Actions.

To view it on GitHub Pages:

1. Open the repository on GitHub.
2. Go to `Actions` and wait for the Pages deployment workflow to finish.
3. Open `Settings > Pages`.
4. Use the published site link shown there.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Main files

- `src/main.jsx`
- `src/styles.css`
