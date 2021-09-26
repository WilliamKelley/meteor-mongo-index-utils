import { Tinytest } from "meteor/tinytest";
import { Mongo } from "meteor/mongo";

Tinytest.add("mongo-index-utils - ensureIndexes - is defined", function (test) {
  const isDefined = "ensureIndexes" in Mongo.Collection.prototype;

  test.isTrue(isDefined);
});

Tinytest.add("mongo-index-utils - hasIndexes - is defined", function (test) {
  const isDefined = "hasIndexes" in Mongo.Collection.prototype;

  test.isTrue(isDefined);
});

Tinytest.add(
  "mongo-index-utils - hasIndexes - is insensitive to default `_id` index spec",
  function (test) {
    const indexSpecs = [
      { key: { fieldA: 1 }, name: "fieldA_1" },
      { key: { _id: 1 }, name: "_id_" },
    ];

    // :TODO: act and assert
  }
);
