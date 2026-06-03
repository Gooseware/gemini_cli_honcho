const { Honcho } = require("@honcho-ai/sdk");
const assert = require("assert");

try {
    assert.ok(Honcho, "Honcho class should be defined");
    console.log("Honcho SDK successfully imported");
} catch (e) {
    console.error(e.message);
    process.exit(1);
}
