/* @flow */

import { expect } from 'chai';
import { UserModel } from '../../__mocks__/userModel.js';
import findMany from '../findMany';
import Resolver from '../../../../graphql-compose/src/resolver/resolver';
import { convertModelToGraphQL } from '../../fieldsConverter';

const UserType = convertModelToGraphQL(UserModel, 'User');


describe('findMany() ->', () => {
  let user1;
  let user2;

  before('clear UserModel collection', (done) => {
    UserModel.collection.drop(() => {
      done();
    });
  });

  before('add test user document to mongoDB', () => {
    user1 = new UserModel({
      name: 'userName1',
      skills: ['js', 'ruby', 'php', 'python'],
      gender: 'male',
      relocation: true,
    });

    user2 = new UserModel({
      name: 'userName2',
      skills: ['go', 'erlang'],
      gender: 'female',
      relocation: false,
    });

    return Promise.all([
      user1.save(),
      user2.save(),
    ]);
  });

  it('should return Resolver object', () => {
    const resolver = findMany(UserModel, UserType);
    expect(resolver).to.be.instanceof(Resolver);
  });

  it('Resolver object should have `filter` arg', () => {
    const resolver = findMany(UserModel, UserType);
    expect(resolver.hasArg('filter')).to.be.true;
  });

  it('Resolver object should have `limit` arg', () => {
    const resolver = findMany(UserModel, UserType);
    expect(resolver.hasArg('limit')).to.be.true;
  });

  it('Resolver object should have `skip` arg', () => {
    const resolver = findMany(UserModel, UserType);
    expect(resolver.hasArg('skip')).to.be.true;
  });

  it('Resolver object should have `sort` arg', () => {
    const resolver = findMany(UserModel, UserType);
    expect(resolver.hasArg('sort')).to.be.true;
  });

  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled Promise', async () => {
      const result = findMany(UserModel, UserType).resolve({});
      await expect(result).be.fulfilled;
    });

    it('should return array of documents if args is empty', async () => {
      const result = await findMany(UserModel, UserType).resolve({});

      expect(result).to.be.instanceOf(Array);
      expect(result).to.have.lengthOf(2);
      expect(result.map(d => d.name)).to.have.members([user1.name, user2.name]);
    });

    it('should limit records', async () => {
      const result = await findMany(UserModel, UserType)
        .resolve({ args: { limit: 1 } });

      expect(result).to.be.instanceOf(Array);
      expect(result).to.have.lengthOf(1);
    });

    it('should skip records', async () => {
      const result = await findMany(UserModel, UserType)
        .resolve({ args: { skip: 1000 } });

      expect(result).instanceOf(Array);
      expect(result).lengthOf(0);
    });

    it('should sort records', async () => {
      const result1 = await findMany(UserModel, UserType)
        .resolve({ args: { sort: { _id: 1 } } });

      const result2 = await findMany(UserModel, UserType)
        .resolve({ args: { sort: { _id: -1 } } });

      expect(`${result1[0]._id}`).not.equal(`${result2[0]._id}`);
    });
  });
});
