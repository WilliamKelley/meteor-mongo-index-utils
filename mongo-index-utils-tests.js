// Import Tinytest from the tinytest Meteor package.
import { Tinytest } from "meteor/tinytest";

// Import and rename a variable exported by mongo-index-utils.js.
import { name as packageName } from "meteor/mongo-index-utils";

// Write your tests here!
// Here is an example.
Tinytest.add('mongo-index-utils - example', function (test) {
  test.equal(packageName, "mongo-index-utils");
});
