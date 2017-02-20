/* @flow */

import { expect } from 'chai';
import { GraphQLInt, GraphQLNonNull, GraphQLObjectType } from 'graphql';
import { Query } from 'mongoose';
import { Resolver, TypeComposer } from 'graphql-compose';
import { UserModel } from '../../__mocks__/userModel';
import updateMany from '../updateMany';
import { composeWithMongoose } from '../../composeWithMongoose';
import typeStorage from '../../typeStorage';


describe('updateMany() ->', () => {
  let UserTypeComposer;

  beforeEach(() => {
    typeStorage.clear();
    UserModel.schema._gqcTypeComposer = undefined;
    UserTypeComposer = composeWithMongoose(UserModel);
  });

  let user1;
  let user2;

  beforeEach('clear UserModel collection', (done) => {
    UserModel.collection.drop(() => {
      done();
    });
  });

  beforeEach('add test user document to mongoDB', () => {
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
      relocation: true,
    });

    return Promise.all([
      user1.save(),
      user2.save(),
    ]);
  });

  beforeEach(() => {
    typeStorage.clear();
  });

  it('should return Resolver object', () => {
    const resolver = updateMany(UserModel, UserTypeComposer);
    expect(resolver).to.be.instanceof(Resolver);
  });

  describe('Resolver.args', () => {
    it('should have `filter` arg', () => {
      const resolver = updateMany(UserModel, UserTypeComposer);
      expect(resolver.hasArg('filter')).to.be.true;
    });

    it('should have `limit` arg', () => {
      const resolver = updateMany(UserModel, UserTypeComposer);
      expect(resolver.hasArg('limit')).to.be.true;
    });

    it('should have `skip` arg', () => {
      const resolver = updateMany(UserModel, UserTypeComposer);
      expect(resolver.hasArg('skip')).to.be.true;
    });

    it('should have `sort` arg', () => {
      const resolver = updateMany(UserModel, UserTypeComposer);
      expect(resolver.hasArg('sort')).to.be.true;
    });

    it('should have `record` arg', () => {
      const resolver = updateMany(UserModel, UserTypeComposer);
      const argConfig = resolver.getArg('record');
      expect(argConfig).property('type').instanceof(GraphQLNonNull);
      expect(argConfig).deep.property('type.ofType.name', 'UpdateManyUserInput');
    });
  });

  describe('Resolver.resolve():Promise', () => {
    it('should be promise', () => {
      const result = updateMany(UserModel, UserTypeComposer).resolve({});
      expect(result).instanceof(Promise);
      result.catch(() => 'catch error if appear, hide it from mocha');
    });

    it('should rejected with Error if args.record is empty', async () => {
      const result = updateMany(UserModel, UserTypeComposer).resolve({ args: {} });
      await expect(result).be.rejectedWith(Error, 'at least one value in args.record');
    });

    it('should change data via args.record in database', (done) => {
      const checkedName = 'nameForMongoDB';
      updateMany(UserModel, UserTypeComposer).resolve({
        args: {
          filter: { _id: user1.id },
          record: { name: checkedName },
        },
      }).then(() => {
        UserModel.collection.findOne({ _id: user1._id }, (err, doc) => {
          expect(doc).property('name').to.be.equal(checkedName);
          done();
        });
      });
    });

    it('should return payload.numAffected', async () => {
      const result = await updateMany(UserModel, UserTypeComposer).resolve({
        args: {
          record: { gender: 'female' },
        },
      });
      expect(result).have.deep.property('numAffected', 2);
    });

    it('should call `beforeQuery` method with non-executed `query` as arg', async () => {
      let beforeQueryCalled = false;
      const result = await updateMany(UserModel, UserTypeComposer).resolve({
        args: {
          record: { gender: 'female' },
        },
        beforeQuery: (query) => {
          expect(query).instanceof(Query);
          beforeQueryCalled = true;
          // modify query before execution
          return query.where({ _id: user1.id })
        }
      });
      expect(beforeQueryCalled).to.be.true;
      expect(result).have.deep.property('numAffected', 1);
    });
  });

  describe('Resolver.getType()', () => {
    it('should have correct output type name', () => {
      const outputType = updateMany(UserModel, UserTypeComposer).getType();
      expect(outputType).property('name')
        .to.equal(`UpdateMany${UserTypeComposer.getTypeName()}Payload`);
    });

    it('should have numAffected field', () => {
      const outputType = updateMany(UserModel, UserTypeComposer).getType();
      const numAffectedField = new TypeComposer(outputType).getField('numAffected');
      expect(numAffectedField).property('type').to.equal(GraphQLInt);
    });

    it('should reuse existed outputType', () => {
      const outputTypeName = `UpdateMany${UserTypeComposer.getTypeName()}Payload`;
      const existedType = new GraphQLObjectType({
        name: outputTypeName,
        fields: () => ({}),
      });
      typeStorage.set(outputTypeName, existedType);
      const outputType = updateMany(UserModel, UserTypeComposer).getType();
      expect(outputType).to.equal(existedType);
    });
  });
});
