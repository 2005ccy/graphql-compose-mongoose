import { expect } from 'chai';
import { UserModel } from '../../__mocks__/userModel.js';
import findOne from '../findOne';
import Resolver from '../../../../graphql-compose/src/resolver/resolver';

describe('findOne() ->', () => {
  let user1;
  let user2;

  before('clear UserModel collection', (done) => {
    UserModel.collection.drop(done);
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
    const resolver = findOne(UserModel);
    expect(resolver).to.be.instanceof(Resolver);
  });

  it('Resolver object should have `filter` arg', () => {
    const resolver = findOne(UserModel);
    expect(resolver.hasArg('filter')).to.be.true;
  });

  it('Resolver object should have `skip` arg', () => {
    const resolver = findOne(UserModel);
    expect(resolver.hasArg('skip')).to.be.true;
  });

  it('Resolver object should have `sort` arg', () => {
    const resolver = findOne(UserModel);
    expect(resolver.hasArg('sort')).to.be.true;
  });

  describe('Resolver.resolve():Promise', () => {
    it('should be fulfilled promise', async () => {
      const result = findOne(UserModel).resolve();
      await expect(result).be.fulfilled;
    });

    it('should return one document if args is empty', async () => {
      const result = await findOne(UserModel).resolve({ args: null });
      expect(result).is.a('object');
      expect(result).have.property('name').that.oneOf([user1.name, user2.name]);
    });

    it('should return document if provided existed id', async () => {
      const result = await findOne(UserModel).resolve({ args: { id: user1._id } });
      expect(result).have.property('name').that.equal(user1.name);
    });

    it('should skip records', async () => {
      const result = await findOne(UserModel).resolve({ args: { skip: 2000 } });
      expect(result).to.be.null;
    });

    it('should sort records', async () => {
      const result1 = await findOne(UserModel)
        .resolve({ args: { sort: { _id: 1 } } });

      const result2 = await findOne(UserModel)
        .resolve({ args: { sort: { _id: -1 } } });

      expect(`${result1._id}`).not.equal(`${result2._id}`);
    });
  });
});
