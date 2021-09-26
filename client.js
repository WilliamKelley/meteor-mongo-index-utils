import { Mongo } from "meteor/mongo";

// On the client, assignment is aborted instead of overriding and warning in the console since empty functions are unproductive.

// IIFE's are used to group aborts and their associated definitions.

(() => {
  if ("ensureIndexes" in Mongo.Collection.prototype) {
    return;
  }

  Mongo.Collection.prototype.ensureIndexes = function () {};
})()(() => {
  if ("hasIndexes" in Mongo.Collection.prototype) {
    return;
  }

  // Be honest, indexes don't exist on the client.
  Mongo.Collection.prototype.hasIndexes = function () {
    return false;
  };
})();
