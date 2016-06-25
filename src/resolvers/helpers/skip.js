/* @flow */

import { GraphQLInt } from 'graphql/type';
import type {
  GraphQLFieldConfigArgumentMap,
  ExtendedResolveParams,
} from '../../definition';


export const skipHelperArgs: GraphQLFieldConfigArgumentMap = {
  skip: {
    name: 'skip',
    type: GraphQLInt,
  },
};

export function skipHelper(resolveParams: ExtendedResolveParams): void {
  const skip = parseInt(resolveParams.args && resolveParams.args.skip, 10);
  if (skip > 0) {
    resolveParams.query = resolveParams.query.skip(skip); // eslint-disable-line
  }
}
