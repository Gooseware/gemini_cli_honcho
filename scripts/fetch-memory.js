if (process.env.SILENT !== "true") {
    require('dotenv').config();
}
const { Honcho } = require("@honcho-ai/sdk");
const fs = require("fs");

async function main() {
    let input;
    try {
        const stdinBuffer = fs.readFileSync(0, "utf-8");
        input = JSON.parse(stdinBuffer);
    } catch (e) {
        input = {};
    }

    const prompt = input.lastMessage?.content || "";
    
    const honcho = new Honcho({
        apiKey: process.env.HONCHO_API_KEY || "not_needed_for_local",
        workspaceId: process.env.HONCHO_WORKSPACE_ID || "default",
        baseURL: process.env.HONCHO_BASE_URL || "http://localhost:8000"
    });

    let relevantMemories = "No relevant memories found.";

    try {
        const user = await honcho.peer("user");
        
        // Use context() which is a high-level retrieval method
        // It's generally the most robust for getting immediate context
        const context = await user.context({
            searchQuery: prompt || undefined
        });
        
        // PeerContext has a representation property which is a string
        relevantMemories = context.representation || relevantMemories;
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

main().catch(error => {
    const fatalOutput = {
        hookSpecificOutput: {
            hookEventName: "BeforeAgent",
            additionalContext: "[Honcho Memory Context]:\nError executing fetch-memory script."
        }
    };
    process.stdout.write(JSON.stringify(fatalOutput));
    process.stderr.write("Fatal Error: " + error.message + "\n");
});
