require('dotenv').config();
const assert = require("assert");

try {
    assert.ok(process.env.HONCHO_WORKSPACE_ID, "HONCHO_WORKSPACE_ID is not set");
    console.log("HONCHO_WORKSPACE_ID is set: " + process.env.HONCHO_WORKSPACE_ID);
} catch (e) {
    console.error(e.message);
    process.exit(1);
}

try {
    assert.ok(process.env.HONCHO_BASE_URL, "HONCHO_BASE_URL is not set");
    console.log("HONCHO_BASE_URL is set: " + process.env.HONCHO_BASE_URL);
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
