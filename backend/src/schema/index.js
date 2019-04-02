import { GraphQLSchema } from 'graphql';
import RootQuery from './types';
import Mutations from './mutations';
import Subscriptions from './subscriptions';

export default new GraphQLSchema({
  query: RootQuery,
  mutation: Mutations,
  subscription: Subscriptions
});
