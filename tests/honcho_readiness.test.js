const { Honcho } = require("@honcho-ai/sdk");
const assert = require("assert");

describe("Honcho Readiness", () => {
    it("should be able to import Honcho SDK", () => {
        assert.ok(Honcho);
    });
});
