import { Mongo } from "meteor/mongo";
import { Promise } from "meteor/promise";

const packageName = "williamkelley:mongo-index-utils";

/**
 * Warns in the console when the given property exists on the given object's prototype.
 * @param {string} property
 * @param {object} object
 * @returns {void}
 */
function warnIfInPrototype(property, object) {
  if (property in object.prototype) {
    console.warn(
      `Warning: \`${property}\` already exists on the prototype of \`${object.name}\`. Atmosphere package \`${packageName}\` is aborting its declaration.`
    );
  }
}

// IIFE's are used to group warnings and their associated definitions.

(() => {
  warnIfInPrototype("_driver_indexExists", Mongo.Collection);

  /**
   * Checks if one or more indexes exist on the collection, fails on first non-existing index
   * @method
   * @param {(string|array)} indexes One or more index names to check.
   * @param {object} [options] Optional settings. s{@link http://mongodb.github.io/node-mongodb-native/3.6/api/lib_collection.js.html See driver API}.
   * @returns {boolean}
   */
  Mongo.Collection.prototype._driver_indexExists = function (indexes, options) {
    return Promise.await(this.rawCollection().indexExists(indexes, options));
  };
})()(() => {
  warnIfInPrototype("_driver_createIndexes", Mongo.Collection);

  /**
   * Creates multiple indexes in the collection
   * @method
   * @param {Collection~IndexDefinition[]} indexSpecs An array of index specifications to be created. {@link http://docs.mongodb.org/manual/reference/command/createIndexes/ See spec definition}.
   * @param {Object} [options] Optional settings. {@link http://mongodb.github.io/node-mongodb-native/3.6/api/lib_collection.js.html See driver API}.
   * @returns {boolean}
   * @example
   *  collection.createIndexes([{
   *    key: { heroId: 1, workoutId: -1 }
   *    name: 'heroId_1_workoutId_-1'
   *  }])
   */
  Mongo.Collection.prototype._driver_createIndexes = function (
    indexSpecs,
    options
  ) {
    return Promise.await(
      this.rawCollection().createIndexes(indexSpecs, options)
    );
  };
})()(() => {
  warnIfInPrototype("ensureIndexes", Mongo.Collection);

  /**
   * Ensure that multiple indexes exist in the collection; if any do not, then they are create created.
   * @method
   * @param {Collection~IndexDefinition[]} indexSpecs An array of index specifications to be created. {@link http://docs.mongodb.org/manual/reference/command/createIndexes/ See spec definition}.
   * @param {Object} [options] Optional settings. {@link http://mongodb.github.io/node-mongodb-native/3.6/api/lib_collection.js.html See driver API}.
   * @returns {void}
   * @example
   *  collection.ensureIndexes([
   *    { key: { heroId: 1 }, name: 'heroId_1' },
   *    { key: { workoutId: 1 }, name: 'workoutId_1' }
   *  ])
   */
  Mongo.Collection.prototype.ensureIndexes = function (indexSpecs, options) {
    // Due to either Meteor's mongo collection wrapper or the native nodejs driver,
    // the collection doesn't exist in the database until the first document is inserted.
    // Thus, raw collection / driver operations will throw unreasonably. So, force existence.
    if (this.find().count() === 0) {
      Promise.await(
        this.rawCollection().insertOne({ _id: "mongo-index-utils" })
      );
      Promise.await(this.rawCollection().remove({ _id: "mongo-index-utils" }));
    }

    // accumulate non-existent indexes
    const missingIndexSpecs = [];
    for (const spec of indexSpecs) {
      if (!this._driver_indexExists(spec.name)) {
        missingIndexSpecs.push(spec);
      }
    }

    // create missing indexes
    if (missingIndexSpecs.length !== 0) {
      this._driver_createIndexes(missingIndexSpecs, options);
    }

    return false;
  };
})()(() => {
  warnIfInPrototype("_driver_indexInformation", Mongo.Collection);

  /**
   * Retrieves this collections index info.
   * @method
   * @param {object} [options] Optional settings. {@link http://mongodb.github.io/node-mongodb-native/3.6/api/lib_collection.js.html See driver API}.
   * @returns {object}
   */
  Mongo.Collection.prototype._driver_indexInformation = function (options) {
    return Promise.await(this.rawCollection().indexInformation(options));
  };
})()(() => {
  warnIfInPrototype("hasIndexes", Mongo.Collection);

  /**
   * Checks the indexes in the collection to see if the given index(es) exist.
   *
   * A collection "has" an index if one exists with the same name, over the same document fields (`"key"` of an index spec). By default, this method is not sensitive to the existence of other indexes in the collection.
   *
   * The default index on the "_id" field is ignored.
   * @method
   * @param {Collection~IndexDefinition[]} indexSpecs An array of index specifications. {@link http://docs.mongodb.org/manual/reference/command/createIndexes/ See spec definition}.
   * @param {object} options Optional settings.
   * @param {boolean} [options.exact=false] Return `false` if there exist indexes in the collection that are not given.
   * @returns {boolean}
   */
  Mongo.Collection.prototype.hasIndexes = function (
    indexSpecs,
    { exact = false }
  ) {
    const indexInfo = this._driver_indexInformation();

    // Every collection is guaranteed to have an index on '_id', so disregard that on both specs and info. (See docs https://docs.mongodb.com/manual/indexes/#default-_id-index)
    delete indexInfo["_id_"];
    // don't modify passed arg
    const nonDefaultIndexSpecs = indexSpecs.filter(
      (spec) =>
        // index has only one key which is "ascending" (value of 1) over the `_id` field.
        spec.key._id !== 1 && Object.keys(spec.key) !== 1
    );

    // Quick fail for exact
    if (exact && nonDefaultIndexSpecs.length !== indexInfo.length) {
      return false;
    }

    for (spec of nonDefaultIndexSpecs) {
      // Example:
      //  given indexSpecs: [{ key: { fieldA: 1 }, name: 'fieldA_1' }]
      //  resulting indexInformation: { _id_: [['_id', 1]], fieldA_1: [['fieldA', 1]] }

      // check name exists on info
      if (!Object.prototype.hasOwnProperty.call(indexInfo, spec.name)) {
        return false;
      }

      // check keys
      const infoValue = indexInfo[spec.name];
      const expectedEntries = Object.entries(spec.key);
      for (expectedEntry of expectedEntries) {
        if (
          infoValue.find(
            (existingEntry) =>
              existingEntry[0] === expectedEntry[0] &&
              existingEntry[1] === expectedEntry[1]
          ) === undefined
        ) {
          return false;
        }
      }
    }

    return true;
  };
})();
