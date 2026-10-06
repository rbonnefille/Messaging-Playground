# SunCo Bot and Messaging Dashboard

This npm-workspaces monorepo contains the Vue messaging dashboard in `client/`
and the Express/TypeScript bot and API server in `server/`.

## Before using this repository

A lot of the logic in this repository was built around my own needs and
personal setup. Cloning the repository and installing dependencies is only
the first step: reproducing all of my workflows requires additional setup
in your own Sunshine Conversations (SunCo), Zendesk, and other services.

To use the same features, you will need to:

- Populate the `.env` values in `client/` and `server/` with your own
  credentials, secrets, application and integration IDs, and service URLs.
  See [client setup](client/README.md) and
  [server environment variables](server/README.md).
- Create a dedicated SunCo webhook for the bot and configure it to deliver
  the relevant events to your server.
- Set up the integrations and switchboard configuration needed by the
  workflows you want to reproduce, and adapt any setup-specific logic.

Some parts of the code are older experiments or integrations that I no
longer use. Review the code before relying on a feature, decide which parts
fit your needs, and clean up or remove unused pieces as appropriate. You
should expect to adapt this project to your environment.

## Installation

Run commands from the repository root using Node.js 26 and npm 11 or newer:

```sh
npm ci
```

Dependencies are declared in the package that uses them. Shared development
tools are declared in the root `package.json`. The root `package-lock.json`
records the complete workspace dependency tree; do not maintain separate
client or server lockfiles.

Use `npm install` when intentionally updating dependencies. For example:

```sh
npm install <package> --workspace=./client
npm install <package> --workspace=./server
```

The root `allowScripts` policy retains the previously approved dependency
installation scripts. Review its version pins when upgrading dependencies.

## Environment

Keep dashboard settings in `client/.env` and backend credentials in
`server/.env`. See [client setup](client/README.md) and
[server environment variables](server/README.md) for the existing settings.
Environment files are not committed.

The server defaults to port 3000. Vite forwards client `/api` requests to
`http://127.0.0.1:3000`; update `client/vite.config.js` if changing the API port.
The backend loads its environment file relative to `server/config/env.ts`,
so launching it through a root workspace command preserves that location.

## Development

```sh
npm run dev
```

This starts Vite and the API server concurrently with labeled output. Ctrl+C
stops both processes, and either process exiting stops the other. The server
continues to use its existing `tsx watch app.ts` startup command.

To start either application independently:

```sh
npm run dev:client
npm run dev:server
```

## Verification

```sh
npm run typecheck
npm run lint
npm run build
npm run check
```

`check` runs the server TypeScript check, both workspace linters, and the
client production build. Linting is read-only; `npm run lint:fix` explicitly
applies automatic fixes. Each workspace has its own ESLint configuration.
Existing unused variables and explicit `any` types are reported as warnings.

The existing application source still has recommended-rule lint errors.
`lint` and `check` will return a non-zero status until those are resolved.

The client build is written to `client/dist/`. The backend remains a separate
service and does not need a compilation output directory for its current
`tsx` workflow. Both applications can still be deployed independently.
