/* @flow */

import type { ComposeFieldConfigMap } from 'graphql-compose';
import {
  EnumTypeComposer,
  graphql,
  schemaComposer,
  SchemaComposer,
  TypeComposer,
} from 'graphql-compose';
import type { GraphQLFieldConfigMap } from 'graphql-compose/lib/graphql';
import type {
  ComposePartialFieldConfigAsObject,
  RelationOpts,
} from 'graphql-compose/lib/TypeComposer';
import { Model } from 'mongoose';
import type { TypeConverterOpts } from './composeWithMongoose';
import { composeWithMongoose } from './composeWithMongoose';
import { composeChildTC } from './discriminators';
import { mergeCustomizationOptions } from './discriminators/merge-customization-options';
import { prepareBaseResolvers } from './discriminators/prepare-resolvers/prepareBaseResolvers';
import { reorderFields } from './discriminators/utils';

const { GraphQLInterfaceType } = graphql;

export type Options = {
  test_disTypes?: boolean,
  reorderFields?: boolean | string[], // true order: _id, DKey, DInterfaceFields, DiscriminatorFields
  customizationOptions?: TypeConverterOpts,
};

type Discriminators = {
  [DName: string]: any,
};

// sets the values on DKey enum TC
function setDKeyETCValues(discriminators: Discriminators): any {
  const values: { [propName: string]: { value: string } } = {};

  for (const DName in discriminators) {
    if (discriminators.hasOwnProperty(DName)) {
      values[DName] = {
        value: DName,
      };
    }
  }

  return values;
}

// creates an enum from discriminator names
// then sets this enum type as the discriminator key field type
function createAndSetDKeyETC(dTC: DiscriminatorTypeComposer, discriminators: Discriminators) {
  const DKeyETC = EnumTypeComposer.create({
    name: `EnumDKey${dTC.getDBaseName()}${dTC.getDKey()[0].toUpperCase() +
      dTC.getDKey().substr(1)}`,
    values: setDKeyETCValues(discriminators),
  });

  // set on Output
  dTC.extendField(dTC.getDKey(), {
    type: () => DKeyETC,
  });

  // set on Input
  dTC.getInputTypeComposer().extendField(dTC.getDKey(), {
    type: () => DKeyETC,
  });

  return DKeyETC;
}

function getBaseTCFieldsWithTypes(baseTC: TypeComposer) {
  const baseFields = baseTC.getFieldNames();
  const baseFieldsWithTypes: GraphQLFieldConfigMap<any, any> = {};

  for (const field of baseFields) {
    baseFieldsWithTypes[field] = {
      type: baseTC.getFieldType(field),
    };
  }

  return baseFieldsWithTypes;
}

function createDInterface(baseModelTC: DiscriminatorTypeComposer): GraphQLInterfaceType {
  return new GraphQLInterfaceType({
    name: baseModelTC.getDBaseName(),

    resolveType: (value: any) => {
      const childDName = value[baseModelTC.getDKey()];
      const sComposer = baseModelTC.getGQC(); // get schemaComposer

      if (childDName) {
        return sComposer.getTC(childDName).getType();
      }

      // as fallback return BaseModelTC
      return sComposer.getTC(baseModelTC.getTypeName()).getType();
    },
    // hoisting issue solved, get at time :)
    fields: () => getBaseTCFieldsWithTypes(baseModelTC),
  });
}

export class DiscriminatorTypeComposer extends TypeComposer {
  modelName: string;

  discriminatorKey: string;

  DKeyETC: EnumTypeComposer;

  GQC: SchemaComposer<any>;

  opts: Options;

  DInterface: GraphQLInterfaceType;

  discriminators: Discriminators;

  childTCs: TypeComposer[];

  constructor(baseModel: Model, opts?: any) {
    if (!baseModel || !(baseModel: any).discriminators) {
      throw Error('Discriminator Key not Set, Use composeWithMongoose for Normal Collections');
    }

    opts = {  // eslint-disable-line
      reorderFields: true,
      customizationOptions: {
        schemaComposer,
      },
      ...opts,
    };

    super(composeWithMongoose(baseModel, opts.customizationOptions).gqType);

    // !ORDER MATTERS
    this.opts = opts;
    this.modelName = (baseModel: any).modelName;
    this.discriminatorKey = (baseModel: any).schema.get('discriminatorKey') || '__t';

    // discriminants and object containing all discriminants with key
    // key being their DNames
    this.discriminators = (baseModel: any).discriminators;

    this.childTCs = [];
    this.GQC =
      opts.customizationOptions && opts.customizationOptions.schemaComposer
        ? opts.customizationOptions.schemaComposer
        : schemaComposer;
    this.setTypeName(`Generic${this.modelName}`);
    this.DKeyETC = createAndSetDKeyETC(this, this.discriminators);

    reorderFields(this, (this.opts: any).reorderFields, this.discriminatorKey);

    this.DInterface = createDInterface(this);
    this.setInterfaces([this.DInterface]);

    // Hoist on _disTypes
    if (opts.test_disTypes) {
      if (!this.GQC.rootQuery().hasField('_disTypes')) {
        this.GQC.rootQuery().addFields({
          _disTypes: TypeComposer.create({
            name: '_disTypes',
            description: 'Hoisting for Discriminator Types',
          }),
        });
      }

      this.GQC.rootQuery()
        .getFieldTC('_disTypes')
        .addFields({
          [this.getTypeName()]: this,
        });
    }

    // prepare Base Resolvers
    prepareBaseResolvers(this);
  }

  getGQC(): SchemaComposer<any> {
    return this.GQC;
  }

  getDKey(): string {
    return this.discriminatorKey;
  }

  getDKeyETC(): EnumTypeComposer {
    return this.DKeyETC;
  }

  getDBaseName(): string {
    return this.modelName;
  }

  getDInterface(): GraphQLInterfaceType {
    return this.DInterface;
  }

  hasChildTC(DName: string): boolean {
    return !!this.childTCs.find(ch => ch.getTypeName() === DName);
  }

  // add fields only to DInterface, baseTC, childTC
  addDFields(newDFields: ComposeFieldConfigMap<any, any>): this {
    super.addFields(newDFields);

    for (const childTC of this.childTCs) {
      childTC.addFields(newDFields);
    }

    return this;
  }

  extendDField(
    fieldName: string,
    partialFieldConfig: ComposePartialFieldConfigAsObject<any, any>
  ): this {
    super.extendField(fieldName, partialFieldConfig);

    for (const childTC of this.childTCs) {
      childTC.extendField(fieldName, partialFieldConfig);
    }

    return this;
  }

  // relations with args are a bit hard to manage as interfaces i believe as of now do not
  // support field args. Well if one wants to have use args, you setType for resolver as this
  // this = this DiscriminantTypeComposer
  // NOTE, those relations will be propagated to the childTypeComposers and you can use normally.
  // FixMe: Note, You must use this function after creating all discriminators
  addDRelation(fieldName: string, relationOpts: RelationOpts<any, any>): this {
    this.addRelation(fieldName, relationOpts);

    for (const childTC of this.childTCs) {
      childTC.addRelation(fieldName, relationOpts);
    }

    return this;
  }

  /* eslint no-use-before-define: 0 */
  discriminator(childModel: Model, opts?: TypeConverterOpts): TypeComposer {
    const customizationOpts = mergeCustomizationOptions(
      (this.opts: any).customizationOptions,
      opts
    );

    let childTC = composeWithMongoose(childModel, customizationOpts);

    childTC = composeChildTC(this, childTC, this.opts);

    this.childTCs.push(childTC);

    return childTC;
  }
}

export function composeWithMongooseDiscriminators(
  baseModel: Model,
  opts?: Options
): DiscriminatorTypeComposer {
  return new DiscriminatorTypeComposer(baseModel, opts);
}
