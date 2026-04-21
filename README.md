# Honcho Memory Extension for Gemini CLI

This extension provides dynamic context injection from your Honcho memory into the Gemini CLI. It uses a `BeforeAgent` hook to fetch recent history for a specific peer and inject it into the agent's context.

## Prerequisites

- **Honcho:** A running Honcho instance (local Docker or hosted).
- **Node.js:** Installed on your system.
- **Gemini CLI:** Installed and configured.

## Installation

1. **Clone the repository:**
   ```bash
   git clone git@github.com:Gooseware/gemini_cli_honcho.git
   cd gemini_cli_honcho
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   Create a `.env` file in the root directory (see `.env.example`):
   ```bash
   HONCHO_API_KEY=not_needed_for_local
   HONCHO_WORKSPACE_ID=default
   HONCHO_BASE_URL=http://localhost:8000
   HONCHO_PEER_ID=hermes-agent
   ```

4. **Install the extension in Gemini CLI:**
   ```bash
   gemini extensions install .
   ```
   *Note: If you are developing, use `gemini extensions link .` instead.*

## How it Works

The extension registers a hook that runs before every agent interaction. It performs the following steps:

1. **Reads Configuration:** Loads Honcho settings from your `.env` file.
2. **Fetches Context:** Queries the Honcho API for the most recent messages associated with the configured `HONCHO_PEER_ID` (default: `hermes-agent`).
3. **Injects Prompt:** Appends the retrieved history as `[Honcho Memory Context]` to the prompt context.

## Configuration Options

| Variable | Description | Default |
| :--- | :--- | :--- |
| `HONCHO_API_KEY` | Your Honcho API key (if required). | `not_needed_for_local` |
| `HONCHO_WORKSPACE_ID` | The Honcho workspace to query. | `default` |
| `HONCHO_BASE_URL` | The base URL of your Honcho API. | `http://localhost:8000` |
| `HONCHO_PEER_ID` | The peer ID whose memory should be retrieved. | `hermes-agent` |

## Troubleshooting

- **Connection Errors:** Ensure your Honcho Docker containers are running and the `HONCHO_BASE_URL` is correct.
- **No Memories Found:** The extension fetches existing messages. If the peer has no history in the specified workspace, it will return a default message.
- **Hook Failures:** Use `gemini hooks list` or `/hooks` within the CLI to verify the hook is registered and active.
