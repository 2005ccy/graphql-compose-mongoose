/* @flow */
/* eslint-disable */

export type ObjectMap = { [optName: string]: any };

export type ComplexTypesT =
 'ARRAY' | 'EMBEDDED' | 'DOCUMENT_ARRAY' | 'ENUM' | 'REFERENCE' | 'SCALAR';

export type MongooseModelSchemaT = {
  paths: {
    [optName: string]: MongooseFieldT,
  },
  _indexes?: MonooseModelIndex[],
}

export type MonooseModelIndex = [
  { [fieldName: string]: number | string },
  { [optionName: string]: mixed },
];

export type MongooseModelT = {
  modelName: string,
  schema: MongooseModelSchemaT,
  create(doc: Object | Object[]): Promise,
  findOne(conditions: ?Object, projection?: Object): MongooseQuery,
  findById(id: mixed, projection?: Object, options?: Object): MongooseQuery,
  find(conditions: ?Object, projection?: Object, options?: Object): MongooseQuery,
  findOneAndRemove(conditions: ?Object, options?: Object): MongooseQuery,
  where(conditions: ObjectMap): MongooseQuery,
  findByIdAndRemove(id: mixed, options?: Object): MongooseQuery,
  findOneAndRemove(conditions: ?Object, options?: Object): MongooseQuery,
}

export type MongooseFieldOptionsT = {
  description: ?string,
}

export type MongooseFieldT = {
  path: string,
  instance: string,
  caster?: ?MongooseFieldT,
  options?: ?MongooseFieldOptionsT,
  enumValues?: ?string[],
  schema: MongooseModelSchemaT,
};

export type MongooseFieldMapT = { [fieldName: string]: MongooseFieldT };

export type ResolverNames = 'findById' | 'findByIds' | 'findOne' | 'findMany' |
                            'updateById' | 'updateOne' | 'updateMany' |
                            'removeById' | 'removeOne' | 'removeMany' |
                            'createOne' | 'count';

export type MongooseQuery = {
  exec(): Promise,
  where(criteria: ObjectMap): MongooseQuery,
  where(fieldName: string, equalTo: string): MongooseQuery,
  where(fieldName: string): MongooseQuery,
  skip(num: number): MongooseQuery,
  limit(num: number): MongooseQuery,
  select(projection: ObjectMap): MongooseQuery,
  sort(fields: ObjectMap): MongooseQuery,
  setOptions(opts: ObjectMap): MongooseQuery,
  update(data: ObjectMap): MongooseQuery,
  remove(conditions: ?Object, options?: Object): MongooseQuery,
  count(conditions: ?Object): MongooseQuery,
};

export type MongoseDocument = {
  set(values: ObjectMap): void,
  save(): Promise,
}

// RE-EXPORT graphql-compose definitions
import type {
  GraphQLObjectType as _GraphQLObjectType,
  GraphQLOutputType as _GraphQLOutputType,
  InputObjectConfigFieldMap as _InputObjectConfigFieldMap,
  ResolveParams as _ResolveParams,
  GraphQLFieldConfigArgumentMap as _GraphQLFieldConfigArgumentMap,
  ResolverMWResolveFn as _ResolverMWResolveFn,
  GraphQLResolveInfo as _GraphQLResolveInfo,
} from 'graphql-compose/lib/definition';

export type GraphQLObjectType = _GraphQLObjectType;
export type GraphQLOutputType = _GraphQLOutputType;
export type InputObjectConfigFieldMap = _InputObjectConfigFieldMap;
export type GraphQLFieldConfigArgumentMap = _GraphQLFieldConfigArgumentMap;
export type ResolveParams = _ResolveParams;
export type GraphQLResolveInfo = _GraphQLResolveInfo;
export type ResolverMWResolveFn = _ResolverMWResolveFn;
export type ExtendedResolveParams = ResolveParams & {
  query: MongooseQuery,
};


// HELPERS OPTIONS

export type genResolverOpts = {
  filter?: filterHelperArgsOpts,
  sort?: sortHelperArgsOpts,
  input?: inputHelperArgsOpts,
  limit?: limitHelperArgsOpts,
}


export type typeConverterOpts = {
  name?: string,
  description?: string,
  fields?: {
    only?: string[],
    // rename?: { [oldName: string]: string },
    remove?: string[],
  },
  inputType?: typeConverterInputTypeOpts,
  resolvers?: false | typeConverterResolversOpts,
};

export type typeConverterInputTypeOpts = {
  name?: string,
  description?: string,
  fields?: {
    only?: string[],
    remove?: string[],
    required?: string[]
  },
};

export type typeConverterResolversOpts = {
  findById?: false,
  findByIds?: false | {
    limit?: limitHelperArgsOpts | false,
    sort?: sortHelperArgsOpts | false,
  },
  findOne?: false | {
    filter?: filterHelperArgsOpts | false,
    sort?: sortHelperArgsOpts | false,
    skip?: false,
  },
  findMany?: false | {
    filter?: filterHelperArgsOpts | false,
    sort?: sortHelperArgsOpts | false,
    limit?: limitHelperArgsOpts | false,
    skip?: false,
  },
  updateById?: false | {
    input?: inputHelperArgsOpts | false,
  },
  updateOne?: false | {
    input?: inputHelperArgsOpts | false,
    filter?: filterHelperArgsOpts | false,
    sort?: sortHelperArgsOpts | false,
    skip?: false,
  },
  updateMany?: false | {
    input?: inputHelperArgsOpts | false,
    filter?: filterHelperArgsOpts | false,
    sort?: sortHelperArgsOpts | false,
    limit?: limitHelperArgsOpts | false,
    skip?: false,
  },
  removeById?: false,
  removeOne?: false | {
    filter?: filterHelperArgsOpts | false,
    sort?: sortHelperArgsOpts | false,
  },
  removeMany?: false | {
    filter?: filterHelperArgsOpts | false,
  },
  createOne?: false | {
    input?: inputHelperArgsOpts | false,
  },
  count?: false | {
    filter?: filterHelperArgsOpts | false,
  },
};

export type filterHelperArgsOpts = {
  filterTypeName?: string,
  isRequired?: boolean,
  onlyIndexed?: boolean,
  requiredFields?: string | string[],
  model?: MongooseModelT,
};

export type sortHelperArgsOpts = {
  sortTypeName?: string,
};

export type inputHelperArgsOpts = {
  inputTypeName?: string,
  isRequired?: boolean,
  removeFields?: string[],
  requiredFields?: string[],
};

export type limitHelperArgsOpts = {
  defaultValue?: number,
};
