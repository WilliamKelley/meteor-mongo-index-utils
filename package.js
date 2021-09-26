Package.describe({
  name: "mongo-index-utils",
  version: "0.0.1",
  summary: "Simple utilities around MongoDB indexes in the Meteor framework.",
  git: "https://github.com/WilliamKelley/meteor-mongo-index-utils",
  documentation: "README.md",
});

Package.onUse(function (api) {
  api.versionsFrom("2.4");
  api.use("ecmascript");
  api.use("mongo");
  api.mainModule("server.js", "server");
  api.mainModule("client.js", "client");
});

Package.onTest(function (api) {
  api.use("ecmascript");
  api.use("mongo");
  api.use("mongo-index-utils");
  api.use("tinytest");
  api.mainModule("client.spec.js", "client");
  api.mainModule("server.spec.js", "server");
});
