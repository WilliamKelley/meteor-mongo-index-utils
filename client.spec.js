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
