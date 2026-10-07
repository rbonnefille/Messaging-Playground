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
VITE_MESSAGING_KEY=
# in case you have many widgets, you add their respective messaging keys below
VITE_MESSAGING_EMEA_KEY=
VITE_MESSAGING_APAC_KEY=

# (legacy) SunCo widget integration id, you would need to create a SunCo widget integration from SunCo's API
VITE_SUNCO_INTEGRATION_ID=

# Zendesk voice line ID, required for the client to interact with the Zendesk Voice API
VITE_ZENDESK_VOICE_LINE_ID=

# SunCo app ID, required for the client to interact with the SunCo API
VITE_SUNCO_APP_ID=
VITE_ZENDESK_SUBDOMAIN=
```

## Usage

From the repository root, run `npm run dev` to start the dashboard and API
server together, or `npm run dev:client` to start only the dashboard.

From this folder, `npm run dev` still starts Vite directly. The development
proxy forwards `/api` requests to `http://127.0.0.1:3000`.
