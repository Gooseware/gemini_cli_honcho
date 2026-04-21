if (process.env.SILENT !== "true") {
    require('dotenv').config();
}
const fs = require("fs");
// We use direct fetch to avoid SDK issues with complex endpoints
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

    let relevantMemories = "No relevant memories found.";

    try {
        // Fallback to the most reliable method: list recent messages across sessions
        // Since we don't have a reliable session ID filter that works globally,
        // we'll try to get the latest messages from the known test-session for this demo.
        const response = await fetchHoncho(`${baseURL}/v3/workspaces/${workspaceId}/sessions/test-session/messages/list`, {
            filters: {}
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
