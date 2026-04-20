# Honcho SDK Research Notes

## Package Information
- **Name:** `@honcho-ai/sdk`
- **Installation:** `npm install @honcho-ai/sdk`

## Core Primitives
- **Honcho Client:** Initialized with `apiKey` and `workspaceId`.
- **Peers:** Represents users or assistants. Used to store and query memory.
- **Sessions:** Logical grouping of messages.
- **Messages:** Content attributed to a peer.

## Key Methods for this Track
- `honcho.peer(name)`: Get or create a peer.
- `peer.chat(query)`: Query the peer's conversational history.
- `session.getContext()`: Get formatted history for LLM prompt injection.

## Implementation Strategy for fetch-memory.js
1. Initialize Honcho client with environment variables (`HONCHO_API_KEY`, `HONCHO_WORKSPACE_ID`).
2. Identify the current peer (user) from context if available.
3. Use `peer.chat()` or `session.getContext()` to retrieve relevant history.
4. Inject the retrieved history into the `additionalContext` field of the hook output.
