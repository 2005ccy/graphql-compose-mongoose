/* @flow */

import { TypeComposer } from 'graphql-compose';
import type { DiscriminatorTypeComposer, Options } from '../composeWithMongooseDiscriminators';
import { prepareChildResolvers } from './prepare-resolvers/prepareChildResolvers';
import { reorderFields } from './utils';

// copy all baseTypeComposers fields to childTC
// these are the fields before calling discriminator
function copyBaseTCFieldsToChildTC(baseDTC: TypeComposer, childTC: TypeComposer) {
  const baseFields = baseDTC.getFieldNames();
  const childFields = childTC.getFieldNames();

  for (const field of baseFields) {
    const childFieldName = childFields.find(fld => fld === field);

    if (childFieldName) {
      childTC.extendField(field, {
        type: baseDTC.getFieldType(field),
      });
    } else {
      childTC.setField(field, baseDTC.getField(field));
    }
  }

  return childTC;
}

export function composeChildTC(
  baseDTC: DiscriminatorTypeComposer,
  childTC: TypeComposer,
  opts: Options
): TypeComposer {
  const composedChildTC = copyBaseTCFieldsToChildTC(baseDTC, childTC);

  composedChildTC.setInterfaces([baseDTC.getDInterface()]);

  // hoist this type
  if (opts.test_disTypes) {
    baseDTC
      .getGQC()
      .rootQuery()
      .getFieldTC('_disTypes')
      .addFields({
        [composedChildTC.getTypeName()]: composedChildTC,
      });
  }

  prepareChildResolvers(baseDTC, composedChildTC, opts);

  reorderFields(
    composedChildTC,
    (opts: any).reorderFields,
    baseDTC.getDKey(),
    baseDTC.getFieldNames()
  );

  return composedChildTC;
}
