# Roblox Time Tracker

A full-stack system that tracks players' time spent in a Roblox game and converts it into Robux rewards. It combines three components: a **Roblox place** (game), a **REST API**, and a **Discord bot**, all connected through a shared **MongoDB** database.

## Overview

When a player joins the Roblox game, a server-side timer begins tracking their session. The time updates a visible leaderboard in-game. When the player leaves, the accumulated time is sent to the API and stored in the database. Players can link their Roblox accounts to their Discord accounts via a validation code system, then check their earned Robux balance and withdraw it through the Discord bot.

The system solves the problem of rewarding loyal players automatically based on actual playtime, bridging the gap between Roblox gameplay and Discord community management.

## Features

- **Automatic time tracking** -- server-side session timer that records seconds played per player
- **In-game leaderboard** -- displays live playtime via Roblox leaderstats
- **Robux reward calculation** -- converts tracked minutes into Robux funds
- **Validation code system** -- generates temporary codes (60s TTL) to securely link Roblox and Discord accounts
- **Discord bot registration** -- slash command (`/register`) to manage linked Roblox accounts (up to 2 per Discord user)
- **Balance checking and withdrawal** -- view earned Robux and withdraw through Discord buttons
- **Server-owner-only command** -- the `/register` command is restricted to the Discord server owner
- **Automatic color matching** -- embed colors are derived from the Discord server's icon

## Tech Stack

| Component | Technology |
|---|---|
| Roblox Place | Lua, Rojo |
| API | TypeScript, Express 5, Mongoose |
| Discord Bot | JavaScript, discord.js v14 |
| Database | MongoDB Atlas (via Mongoose) |
| Roblox HTTP | HttpService |
| Package Manager | npm |

### Key Libraries

**API:** `express`, `mongoose`, `cors`, `dotenv`, `typescript`, `nodemon`

**Bot:** `discord.js`, `mongoose`, `quick.db`, `node-fetch`, `fast-average-color-node`, `ascii-table`, `dotenv`

## Project Structure

```
Roblox-time-tracker/
├── api/                          # REST API (TypeScript)
│   ├── src/
│   │   ├── index.ts              # Entry point, Express routes
│   │   ├── controller/
│   │   │   └── mongoConn.ts      # MongoDB connection
│   │   ├── middlewares/
│   │   │   └── auth.ts           # Authorization header middleware
│   │   ├── schemas/
│   │   │   ├── timeSchema.ts     # Time tracking model
│   │   │   └── validSchema.ts    # Validation code model
│   │   └── utils/
│   │       └── vaildCode.ts      # Random validation code generator
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env
│   └── .env.example
│
├── bot/                          # Discord Bot (JavaScript)
│   ├── index.js                  # Entry point, client setup
│   ├── commands/
│   │   └── register.js           # /register slash command
│   ├── controller/
│   │   └── mongoConn.js          # MongoDB connection
│   ├── schemas/
│   │   ├── buttonSchema.js       # Button interaction tracking
│   │   ├── timeSchema.js         # Time tracking model
│   │   ├── usersSchema.js        # Discord-Linked Roblox accounts
│   │   └── validSchema.js        # Validation code model
│   ├── utils/
│   │   ├── accountsEmbed.js      # Account management embed builder
│   │   ├── BaseSlashCommand.js   # Base class for slash commands
│   │   ├── formatTime.js         # Time formatting (hours/min/sec)
│   │   ├── registry.js           # Command loader
│   │   └── verfiyUser.js         # Roblox username lookup with retry
│   ├── package.json
│   ├── .env
│   └── .env.example
│
├── roblox_place/                 # Roblox Game (Lua, Rojo project)
│   └── roblox discord bot/
│       ├── default.project.json  # Rojo project configuration
│       └── src/
│           ├── ServerScriptService/
│           │   ├── ApiClient.lua          # HTTP client for the API
│           │   ├── Main.server.lua        # Player join/leave hooks
│           │   ├── Security.lua           # Player validation
│           │   ├── TimeTracker.lua        # Session timer logic
│           │   ├── leaderstats.server.lua # Leaderboard setup
│           │   └── Validation.server.lua  # RemoteFunction for codes
│           └── StarterGui/
│               └── ScreenGui/
│                   └── regBtnScript.client.lua  # In-game validation UI
│
├── sourcemap.json                # Rojo source map
├── LICENSE                       # MIT License
└── README.md
```

## Requirements

- **Node.js** (v16 or higher recommended for discord.js v14)
- **npm**
- **MongoDB Atlas** account (or a local MongoDB instance)
- **Roblox Studio** with [Rojo](https://rojo.space) plugin installed
- A **Discord Bot** application (create at [Discord Developer Portal](https://discord.com/developers/applications))
- A **Roblox Group** with sufficient Robux funds for payouts

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/mahmoudplay/Roblox-time-tracker.git
cd Roblox-time-tracker
```

### 2. Install API dependencies

```bash
cd api
npm install
```

### 3. Install Bot dependencies

```bash
cd ../bot
npm install
```

### 4. Sync the Roblox place

Open the `roblox_place/roblox discord bot` folder in Rojo and sync it into Roblox Studio, or use `rojo serve` from that directory.

## Configuration

### API (`.env`)

Create `api/.env` from the example file and fill in your values:

```bash
cd api
cp .env.example .env
```

| Variable | Description | Required | Example |
|---|---|---|---|
| `PORT` | Port the API server listens on | No (defaults to `3000`) | `3000` |
| `AUTH` | Shared secret for authorizing requests between the Roblox place and API | Yes | `your-secret-key` |
| `MONGODB_LINK` | MongoDB connection string | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/TimeDb` |

### Discord Bot (`.env`)

Create `bot/.env` from the example file and fill in your values:

```bash
cd bot
cp .env.example .env
```

| Variable | Description | Required | Example |
|---|---|---|---|
| `TOKEN` | Discord bot token from the Developer Portal | Yes | `MTQ4...` |
| `CLIENT_ID` | Discord application/client ID | Yes | `1483196700725215332` |
| `AUTH` | Same shared secret as the API (must match) | Yes | `your-secret-key` |
| `MONGODB_LINK` | Same MongoDB connection string as the API | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/TimeDb` |

### Roblox Place

The Roblox place stores the API authorization key via `HttpService:GetSecret("AUTH")`. You must configure this secret in Roblox Studio's Game Settings under the **Security** tab. The API URL is hardcoded to `http://localhost:3000/` in `ApiClient.lua` -- update it if deploying the API elsewhere.

## Running the Project

All three components must run simultaneously:

### 1. Start the API

```bash
cd api
npm run dev
```

This uses `nodemon` to run the TypeScript source with auto-reloading. The API starts on the configured `PORT` (default `3000`).

### 2. Start the Discord Bot

```bash
cd bot
node index.js
```

The bot connects to Discord, registers slash commands globally, and connects to MongoDB.

### 3. Start the Roblox Place

Use Rojo to serve or sync the place into Roblox Studio:

```bash
cd "roblox_place/roblox discord bot"
rojo serve
```

Or open the project in the Rojo plugin within Roblox Studio.

## Production / Build

### API

```bash
cd api
npm run build    # Compiles TypeScript to dist/
npm start         # Runs the compiled output from dist/
```

The `build` script compiles TypeScript to the `dist/` directory. The `start` script runs `node dist/index`.

### Roblox Place

Publish the place through Roblox Studio to your desired game/place.

## Usage

### Discord Workflow

1. **Server owner** runs `/register` in a Discord channel. This posts an embed with interactive buttons.
2. **Players** click the **Register** button to manage their linked Roblox accounts.
3. Players click **Add Account**, enter their Roblox username and a validation code obtained from the in-game UI.
4. Up to 2 Roblox accounts can be linked per Discord user.
5. Players can **Remove Account** via a select menu.
6. **Balance** button shows accumulated Robux across all linked accounts.
7. **Withdraw** button collects funds (minimum 10 Robux required).

### In-Game Workflow

1. Player joins the game -- a timer starts automatically.
2. The `Time` value on the leaderboard updates every 3 seconds.
3. Player clicks the registration button in the ScreenGui, then **Get Code** to receive a validation code.
4. Player enters this code in the Discord bot's registration modal to link their account.
5. When the player leaves, their total time is posted to the API and converted to Robux funds.

## API Documentation

The API runs on `http://localhost:<PORT>` (default `3000`).

All mutating endpoints require an `authorization` header matching the `AUTH` environment variable.

### Endpoints

#### `GET /`

Health check. Returns `200 OK`.

#### `POST /`

Records play time for a player.

**Headers:**

| Header | Value |
|---|---|
| `authorization` | The shared `AUTH` secret |
| `Content-Type` | `application/json` |

**Request Body:**

```json
{
  "username": "mahmoudplay",
  "userId": 123456789,
  "minutes": 15
}
```

**Behavior:**

- If the user already exists, their `time` and `funds` are incremented.
- If the user is new, a new record is created.
- Funds are calculated as: `minutes * 0.0011111111111111` Robux.
- Returns `400` if `username`, `userId`, or `minutes` is missing.
- Returns `404` if the `authorization` header is missing or incorrect.

#### `POST /validation`

Generates a validation code for account linking.

**Headers:**

| Header | Value |
|---|---|
| `authorization` | The shared `AUTH` secret |
| `Content-Type` | `application/json` |

**Request Body:**

```json
{
  "userId": 123456789
}
```

**Response:**

```json
{
  "code": "AbCdEf-GhIjKl"
}
```

The code expires after 60 seconds (handled by MongoDB TTL index).

## Database

**MongoDB Atlas** (or compatible) is used across all three components. The connection string is specified via the `MONGODB_LINK` environment variable.

### Collections

| Collection | Used By | Purpose |
|---|---|---|
| `Time` | API, Bot | Stores per-player play time and Robux funds (keyed by Roblox `userId`) |
| `Users` | Bot | Maps Discord user IDs to linked Roblox accounts (up to 2 per user) |
| `Validation` | API, Bot | Temporary validation codes with a 60-second TTL |
| `Buttons` | Bot | Maps Discord button custom IDs to their parent command name |

### Time Document Schema

```json
{
  "username": "string",
  "userId": "number (unique)",
  "time": "number",
  "funds": "number (default: 0)"
}
```

### Users Document Schema

```json
{
  "username": "string",
  "user_id": "number",
  "accounts": [
    {
      "roblox_username": "string",
      "roblox_userId": "number"
    }
  ]
}
```

### Validation Document Schema

```json
{
  "userId": "number",
  "vCode": "string",
  "createdAt": "Date (auto-expires after 60 seconds)"
}
```

## Troubleshooting

- **API returns 404 on POST requests** -- Ensure the `authorization` header is included and matches the `AUTH` value in the API's `.env`.
- **Bot does not register commands** -- Verify `CLIENT_ID` and `TOKEN` are correct. Slash commands may take up to an hour to propagate globally on Discord.
- **Validation code always fails** -- The code expires after 60 seconds. Ensure the player enters it promptly. Also confirm both the API and bot share the same `MONGODB_LINK`.
- **Roblox place cannot reach API** -- The API URL is set to `http://localhost:3000/` in `ApiClient.lua`. If the API is hosted remotely, update this URL. Also ensure HTTP requests are enabled in Roblox Studio Game Settings.
- **MongoDB connection errors** -- Check that the connection string in `.env` is valid and the MongoDB Atlas IP whitelist includes your server's IP.

## License

[MIT License](LICENSE) -- Copyright (c) 2026 mahmoudplay

## Author

[@mahmoudplay](https://www.github.com/mahmoudplay)
