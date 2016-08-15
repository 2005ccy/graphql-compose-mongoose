## master

## 1.0.9 (August 15, 2016)
- fix: babel build via the workaround https://phabricator.babeljs.io/T2877#78089 Huh, it's to tricky to use Map/Set in ES5.

## 1.0.8 (August 13, 2016)
- fix: babel build process

## 1.0.7 (August 10, 2016)
- Update packages, add `babel-plugin-transform-runtime` for build process. Fix [issue](https://github.com/nodkz/graphql-compose-connection/issues/2) for vanilla node.js users without babel (thanks @jacobbubu).

## 1.0.6 (August 8, 2016)
- Fix `projection` extraction from `record` for `updateById` and `updateOne` resolvers.
- Intermediate types now passed to TypeStorage (Enums, SubSchemas) when converting mongoose models.

## 1.0.5 (July 22, 2016)
- Added typeStorage. If you create resolver in second time, it should reuse existed internal types

## 1.0.4 (July 20, 2016)
* Expose `fieldsConverter` methods
* Fix filterHelper: if `filter` InputType without fields, then do not add it to args
* Fix projectionHelper: make projection flat, before passing to mongoose
* Add `convertSchemaToGraphQL` method for creating cached graphql type from MongooseSchema

## 1.0.3 (July 18, 2016)
* HotFix for connection resolver
* HotFix for operators' types in `filter` helper

## 1.0.1 (July 18, 2016)
* Fix `peerDependencies`
* Update `flow` till 0.29
* Other small fixes

## 1.0.0 (July 15, 2016)
* Add connection resolver
* Add support for filtering with operators $gt, $gte, $lt, $lte, $ne, $in, $nin
* Small fixes

## 0.0.6 (July 08, 2016)
* Rename `input` argument to `record` for mutations (due `graphql-compose-relay` compatibility).
`input` is a reserved name for mutations' arg in Relay, and may contains not only document/record data (eg. clientMutationId, sort and filter args). So better solution for `graphql-compose-mongoose` do not use this name, cause `graphql-compose-relay` get all args from mongoose resolvers and put them to `input` arg.

## 0.0.5 (July 07, 2016)
* Refactor Resolvers due changes in graphql-compose api
* Exports flow annotations

## 0.0.3 (July 01, 2016)
* First beta version

## 0.0.1 (June 07, 2016)
* Initial commit
