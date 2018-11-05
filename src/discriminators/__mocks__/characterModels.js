/* @flow */

import type { MongooseModel } from 'mongoose';
import { mongoose, Schema, Types } from '../../__mocks__/mongooseCommon';
import { DroidSchema } from './droidSchema';
import { PersonSchema } from './personSchema';

const enumCharacterType = {
  PERSON: 'Person',
  DROID: 'Droid',
};

export const CharacterObject = {
  _id: {
    type: String,
    default: () => new Types.ObjectId(),
  },
  name: String,

  type: {
    type: String,
    require: true,
    enum: (Object.keys(enumCharacterType): Array<string>),
  },
  kind: {
    type: String,
    require: true,
    enum: (Object.keys(enumCharacterType): Array<string>),
  },

  friends: [String], // another Character
  appearsIn: [String], // movie
};

const CharacterSchema = new Schema(CharacterObject);
const ACharacterSchema = new Schema(Object.assign({}, CharacterObject));

export function getCharacterModels(DKey: string) {
  CharacterSchema.set('discriminatorKey', DKey);

  const CharacterModel: MongooseModel = mongoose.models.Character
    ? mongoose.models.Character
    : mongoose.model('Character', CharacterSchema);

  const PersonModel: MongooseModel = mongoose.models[enumCharacterType.PERSON]
    ? mongoose.models[enumCharacterType.PERSON]
    : CharacterModel.discriminator(enumCharacterType.PERSON, PersonSchema);

  const DroidModel: MongooseModel = mongoose.models[enumCharacterType.DROID]
    ? mongoose.models[enumCharacterType.DROID]
    : CharacterModel.discriminator(enumCharacterType.DROID, DroidSchema);

  return { CharacterModel, PersonModel, DroidModel };
}

export function getCharacterModelClone() {
  const NoDKeyCharacterModel = mongoose.model('NoDKeyCharacter', ACharacterSchema);

  /*
    const APersonModel = ACharacterModel.discriminator('A' + enumCharacterType.PERSON, PersonSchema.clone());

    const ADroidModel = ACharacterModel.discriminator('A' + enumCharacterType.DROID, DroidSchema.clone());
  */

  return { NoDKeyCharacterModel }; // APersonModel, ADroidModel };
}
