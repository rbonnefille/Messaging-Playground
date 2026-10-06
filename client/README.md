# Messaging Dashboard

## Description

Simple frontend app developed with Vue.js in order to work with the SunCo and Messaging Widgets.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

- clone the repo
- run `npm ci` from the repository root to install both workspaces
- create an environment file `.env` and add the following variables:

```
VITE_MESSAGING_ACME_KEY=
VITE_SUNCO_INTEGRATION_ID=
VITE_SUNCO_APP_ID=
```

## Usage

From the repository root, run `npm run dev` to start the dashboard and API
server together, or `npm run dev:client` to start only the dashboard.

From this folder, `npm run dev` still starts Vite directly. The development
proxy forwards `/api` requests to `http://127.0.0.1:3000`.
