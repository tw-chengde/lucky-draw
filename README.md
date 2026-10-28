# Lucky Draw

Built with Nuxt 4.

## Setup

Use Node.js `22.23.4` (pinned in `.nvmrc`) and its bundled npm.
Nuxt requires Node.js `^22.22.3 || ^24.15.0 || >=26.0.0`; Node.js 18 is unsupported.

Install the committed dependencies:

```bash
npm ci
```

After changing dependencies, run `npm install` and commit both `package.json` and
`package-lock.json`. Cloudflare Pages uses `npm ci`, which rejects an incomplete
or out-of-date lockfile.

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Cloudflare Pages

Use these build settings:

| Setting | Value |
| --- | --- |
| Framework preset | Nuxt.js |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Repository root |

Cloudflare reads `.nvmrc` before installing dependencies. If the project
already sets `NODE_VERSION` in Cloudflare, update it to `22.23.4` for both
production and preview builds, or remove it to use the committed version file.
See Cloudflare's [build image documentation](https://developers.cloudflare.com/pages/configuration/build-image/)
and [Nuxt deployment guide](https://developers.cloudflare.com/pages/framework-guides/deploy-a-nuxt-site/).

To verify the Pages build locally:

```bash
npm ci
npm run build -- --preset=cloudflare_pages
```

Commit and push the version file, manifest, and repaired lockfile, then retry the
Cloudflare deployment.
