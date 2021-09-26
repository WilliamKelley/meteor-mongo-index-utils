# Meteor Mongo Index Utilities

Simple utilities around MongoDB indexes in the Meteor framework. Extends Meteor's `Mongo.Collection` prototype with additional synchronous index operations in a pseudo-isomorphic manner.

## Contents

1. [API](#-api)
   - [ensureIndexes(...)](#-ensureindexesindexspecs-options)
2. ["Pseudo-isomorphic"](#-pseudo-isomorphic)
3. [Extending the prototype](#-extending-the-prototype)

## API

### ensureIndexes(indexSpecs, options)

Ensure that multiple indexes exist in the collection; if any do not, then they are create created.

**Note**: Mirrors the [signature of `createIndexes` in the Node.js MongoDB Driver API](http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#createIndexes). Please refer to this source for richer specification or advanced usage.

| Name       | Type                           | Description                                                                                                                                                                                                                                                         |
| ---------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| indexSpecs | `Collection~IndexDefinition[]` | An array of raw index specifications. See [definition on MongoDB docs](https://docs.mongodb.com/manual/reference/command/createIndexes/#mongodb-dbcommand-dbcmd.createIndexes) under the expanded property documentation of the `indexes` parameter (second table). |
| options    | `object`                       | Optional settings.                                                                                                                                                                                                                                                  |

**Returns**:

`void`

**Example**

```js
const collection = new Mongo.Collection("assignments");

collection.ensureIndexes([
  // Two named indexes on different fields.
  { key: { studentId: 1 }, name: "studentId_1" },
  { key: { curriculumId: 1 }, name: "curriculumId_1" },
]);
```

### hasIndexes(indexSpecs, options)

Checks the indexes in the collection to see if the given index(es) exist.

A collection "has" an index if one exists with the same name, over the same document fields (`"key"` of an index spec). By default, this method is not sensitive to the existence of other indexes in the collection.

The default index on the "\_id" field is ignored.

| Name          | Type                           | Description                                                                                                                                                                                                                                                         |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| indexSpecs    | `Collection~IndexDefinition[]` | An array of raw index specifications. See [definition on MongoDB docs](https://docs.mongodb.com/manual/reference/command/createIndexes/#mongodb-dbcommand-dbcmd.createIndexes) under the expanded property documentation of the `indexes` parameter (second table). |
| options       | `object`                       | Optional settings.                                                                                                                                                                                                                                                  |
| options.exact | `boolean`                      | Return `false` if there exist indexes in the collection that are not given.                                                                                                                                                                                         |

**Returns**:

`boolean`

**Example**

```js
const collection = new Mongo.Collection("assignments");

const indexSpecs = [
  { key: { studentId: 1 }, name: "studentId_1" },
  { key: { curriculumId: 1 }, name: "curriculumId_1" },
];

collection.ensureIndexes(indexSpecs);

// true
collection.hasIndexes(indexSpecs);

// false (index doesn't exist)
collection.hasIndexes({ key: { submittedAt: 1 }, name: "submittedAt_1" });

collection.ensureIndexes([{ key: { createdAt: 1 }, name: "createdAt_1" }]);

// false (additional index is present)
collection.hasIndexes(indexSpecs, { exact: true });
```

## "Pseudo-isomorphic"

The utilities are declared isomorphically, meaning they're callable on both the client and server. However, the client implementation is just an empty function, hence "pseudo". Indexes are only useful on the server since Minimongo (a (web) client-side implementation of MongoDB) does not support indexes currently.

So why isomorphic? Simply to ease your experience as a developer. You don't have to worry about the environment you call a utility, it just works.

## Extending the prototype

Extending the prototype of an object that your package does not "own" is generally a bad idea -- and for good reason (understanding why is an exercise left to the reader). However, this package tries to manage the risk of extending prototypes to realize the benefits of brevity and simplicity.

This package extends the `Mongo.Collection` prototype of the `mongo` Atmosphere package. Before extension, the prototype is checked for existence of a property with the same name as the utility. If found, a warning will be sent to the console and _the existing property value will be overridden_.
