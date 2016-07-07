/* @flow */
/* eslint-disable no-param-reassign */

import type {
  MongooseModelT,
  ExtendedResolveParams,
  genResolverOpts,
} from '../definition';
import { Resolver, TypeComposer } from 'graphql-compose';
import { GraphQLInt } from 'graphql';

import { filterHelperArgs, filterHelper } from './helpers/filter';


export default function count(
  model: MongooseModelT,
  typeComposer: TypeComposer,
  opts?: genResolverOpts
): Resolver {
  if (!model || !model.modelName || !model.schema) {
    throw new Error(
      'First arg for Resolver count() should be instance of Mongoose Model.'
    );
  }

  if (!(typeComposer instanceof TypeComposer)) {
    throw new Error('Second arg for Resolver count() should be instance of TypeComposer.');
  }

  return new Resolver(typeComposer, {
    outputType: GraphQLInt,
    name: 'count',
    kind: 'query',
    args: {
      ...filterHelperArgs(typeComposer, {
        filterTypeName: `Filter${typeComposer.getTypeName()}Input`,
        model,
        ...(opts && opts.filter),
      }),
    },
    resolve: (resolveParams : ExtendedResolveParams) => {
      resolveParams.query = model.find();
      filterHelper(resolveParams);
      return resolveParams.query.count().exec();
    },
  });
}
