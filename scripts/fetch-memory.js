if (process.env.SILENT !== "true") {
    require('dotenv').config();
}
const fs = require("fs");
const http = require("http");

async function main() {
    let input;
    try {
        const stdinBuffer = fs.readFileSync(0, "utf-8");
        input = JSON.parse(stdinBuffer);
    } catch (e) {
        input = {};
    }

    const prompt = input.lastMessage?.content || "";
    
    const workspaceId = process.env.HONCHO_WORKSPACE_ID || "default";
    const baseURL = process.env.HONCHO_BASE_URL || "http://localhost:8000";
    const peerId = process.env.HONCHO_PEER_ID || "hermes-agent";

    let relevantMemories = "No relevant memories found.";

    try {
        // Retrieve the latest messages for the peer across the workspace
        // This uses the broad list endpoint which is robust for local installations
        const response = await fetchHoncho(`${baseURL}/v3/workspaces/${workspaceId}/messages/list`, {
            filters: {
                "peer_id": peerId
            }
        });

        if (response && response.items && response.items.length > 0) {
            // Sort by creation to get newest first
            const sorted = response.items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            relevantMemories = "Recent Honcho History:\n" + 
                sorted.slice(0, 5).map(m => `- ${m.content}`).join("\n");
        }
    } catch (e) {
        relevantMemories = "Honcho Connection unavailable. Skipping memory retrieval.";
        process.stderr.write("Honcho Error: " + e.message + "\n");
    }

    const output = {
        hookSpecificOutput: {
            hookEventName: "BeforeAgent",
            additionalContext: `[Honcho Memory Context]:\n${relevantMemories}`
        }
    };

    process.stdout.write(JSON.stringify(output));
}

function fetchHoncho(url, body) {
    return new Promise((resolve, reject) => {
        const u = new URL(url);
        const options = {
            hostname: u.hostname,
            port: u.port,
            path: u.pathname,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', (e) => reject(e));
        req.write(JSON.stringify(body));
        req.end();
    });
}

main().catch(error => {
    const fatalOutput = {
        hookSpecificOutput: {
            hookEventName: "BeforeAgent",
            additionalContext: "[Honcho Memory Context]:\nError executing fetch-memory script."
        }
    };
    process.stdout.write(JSON.stringify(fatalOutput));
});
