import { GraphQLObjectType } from 'graphql';
import conversationType from './conversationType';
import cursorType from '../cursor/cursorType';

const conversationEdgeType = new GraphQLObjectType({
  name: 'ConversationEdge',
  fields: () => ({
    cursor: {
      type: cursorType,
      resolve: (parent) => {
        return {
          value: parent._id.toString(),
        }
      }
    },
    node: {
      type: conversationType,
      resolve: (parent) => parent,
    },
  }),
});

export default conversationEdgeType;