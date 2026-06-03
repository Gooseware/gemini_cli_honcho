const { execSync } = require("child_process");
const assert = require("assert");

function runTest(name, testFn) {
    try {
        testFn();
        console.log("PASS: " + name);
    } catch (e) {
        console.error("FAIL: " + name);
        console.error(e.message);
        process.exit(1);
    }
}

runTest("should process mock input and return valid JSON", () => {
    const mockInput = JSON.stringify({
        lastMessage: { content: "test prompt" }
    });

    const outputString = execSync("node scripts/fetch-memory.js", {
        input: mockInput,
        encoding: "utf-8",
        env: { ...process.env, SILENT: "true" }
    });

    const output = JSON.parse(outputString);
    assert.ok(output.hookSpecificOutput, "Output should have hookSpecificOutput");
    assert.strictEqual(output.hookSpecificOutput.hookEventName, "BeforeAgent");
    assert.ok(output.hookSpecificOutput.additionalContext.includes("[Honcho Memory Context]"), "Context should include Honcho Memory Context header");
});

runTest("should handle empty/invalid input gracefully", () => {
    const outputString = execSync("node scripts/fetch-memory.js", {
        input: "not json",
        encoding: "utf-8",
        env: { ...process.env, SILENT: "true" }
    });

    const output = JSON.parse(outputString);
    assert.ok(output.hookSpecificOutput, "Output should have hookSpecificOutput even on error");
    assert.ok(output.hookSpecificOutput.additionalContext.includes("[Honcho Memory Context]"), "Context should include Honcho Memory Context header");
});
