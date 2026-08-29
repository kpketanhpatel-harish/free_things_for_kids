import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  chooseKeeper,
  isSuburbanAddress,
  normalizeOfferName,
  rowMatchesFoam,
  streetFingerprint,
} from "../scripts/lib/matchRestaurantOffer.mjs";

describe("restaurant offer matching", () => {
  it("normalizes names so Crosby variants match", () => {
    assert.equal(normalizeOfferName("Crosby’S Kitchen"), "crosbys kitchen");
    assert.equal(normalizeOfferName("Crosby's Kitchen"), "crosbys kitchen");
  });

  it("fingerprints ranged street addresses", () => {
    assert.equal(
      streetFingerprint("3455-3457 N SOUTHPORT AVE 1ST, Chicago, IL 60657"),
      "3455|southport",
    );
  });

  it("does not collapse Little Goat Southport with West Loop", () => {
    const foam = {
      match: {
        nameIncludes: ["little goat"],
        addressIncludes: ["southport"],
        addressExcludes: ["randolph"],
      },
    };
    assert.equal(
      rowMatchesFoam(
        {
          restaurant_name: "Itoko / Gg'S Chicken Shop / Little Goat Diner",
          address: "3323-3325 N SOUTHPORT AVE LL-2, Chicago, IL 60657",
        },
        foam,
      ),
      true,
    );
    assert.equal(
      rowMatchesFoam(
        {
          restaurant_name: "Little Goat Diner",
          address: "820 W Randolph St, Chicago, IL 60607",
        },
        foam,
      ),
      false,
    );
  });

  it("does not treat a Monday Big Star row as the weekend brunch deal", () => {
    const foam = {
      match: {
        nameIncludes: ["big star"],
        addressIncludes: ["damen"],
        requireSameDays: ["Saturday", "Sunday"],
      },
    };
    assert.equal(
      rowMatchesFoam(
        {
          restaurant_name: "Big Star",
          address: "1531 N Damen Ave, Chicago, IL 60622",
          eligible_days: ["Monday"],
        },
        foam,
      ),
      false,
    );
  });

  it("skips suburban addresses", () => {
    assert.equal(isSuburbanAddress("543 Madison St, Oak Park, IL 60302"), true);
    assert.equal(
      isSuburbanAddress("3947 S King Dr, Chicago, IL 60653"),
      false,
    );
  });

  it("prefers a published row with an address as keeper", () => {
    const keeper = chooseKeeper([
      {
        id: "a",
        status: "draft",
        address: "3455 N Southport Ave",
        eligible_hours: "4PM-6PM",
      },
      {
        id: "b",
        status: "published",
        address: "3455 N Southport Ave",
        eligible_hours: "See offer details",
      },
    ]);
    assert.equal(keeper.id, "b");
  });
});
