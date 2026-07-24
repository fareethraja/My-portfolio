import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { canonicalSearchLocation, LOCATION_CATALOG } from "../locations";

describe("opening search locations", () => {
    it("offers broad India employment-city coverage without duplicates", () => {
        const india = LOCATION_CATALOG.find((entry) => entry.country === "India");
        assert.ok(india);
        assert.ok(india.cities.length >= 40);
        assert.equal(new Set(india.cities).size, india.cities.length);
        ["Bengaluru", "Chennai", "Bhubaneswar", "Mysuru", "Visakhapatnam", "Lucknow", "Guwahati", "Kozhikode"].forEach((city) => {
            assert.ok(india.cities.includes(city));
            assert.match(canonicalSearchLocation(city, "India"), /India/);
        });
    });

    it("retains global hubs and custom-country fallback behavior", () => {
        assert.ok(LOCATION_CATALOG.length >= 20);
        assert.equal(canonicalSearchLocation("Paris", "France"), "Paris, France");
    });
});