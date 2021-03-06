import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Text
} from 'react-native';
import { encode as btoa } from 'base-64';
import { useMutation, useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import get from 'lodash.get';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { SendMessage } from '../../mutations/Message';
import { Viewer } from '../../queries/Viewer';

const ConversationInput = ({ conversationId }) => {
  const [content, changeText] = useState('');

  // read userId from the cache.
  const {
    data: { viewer }
  } = useQuery(Viewer, { fetchPolicy: 'cache-only' });
  const userId = get(viewer, 'userId') || '';

  const [sendMessage] = useMutation(SendMessage, {
    variables: { content, conversationId, created: new Date() },
    onError: err => {
      console.log('SendMessage Mutation Error: [', err, ']');
    },
    optimisticResponse: {
      sendMessage: {
        __typename: 'Message',
        id: new Date().getTime().toString(),
        messageId: new Date().getTime().toString(),
        created_at: new Date(),
        senderId: userId,
        conversationId,
        content,
        isOptimistic: true
      }
    },
    update: (cache, { data }) => {
      const isOptimistic = data.sendMessage.isOptimistic;
      const encodedConversationId = btoa(`Conversation:${conversationId}`);

      const convo = cache.readFragment({
        id: encodedConversationId,
        fragment: gql`
          fragment ConversationInput_Conversation on Conversation {
            __typename
            id
            conversationId
            title
            recipients {
              id
              name
            }
            messages(first: 20, order: -1) @connection(key: "messages") {
              __typename
              pageInfo {
                __typename
                hasNextPage
                hasPreviousPage
              }
              edges {
                __typename
                cursor
                node {
                  id
                  messageId
                  conversationId
                  senderId
                  content
                  created_at
                  onFlight @client
                  __typename
                }
              }
            }
          }
        `
      });

      const newMessage = {
        __typename: 'MessageEdge',
        cursor: data.sendMessage.id,
        node: {
          id: data.sendMessage.id,
          __typename: 'Message',
          messageId: data.sendMessage.messageId,
          senderId: data.sendMessage.senderId,
          conversationId,
          content: data.sendMessage.content,
          created_at: data.sendMessage.created_at,
          onFlight: !!isOptimistic
        }
      };

      cache.writeFragment({
        id: encodedConversationId,
        fragment: gql`
          fragment Conversation_Conversation on Conversation {
            __typename
            id
            conversationId
            title
            recipients {
              id
              name
            }
            messages(first: 20, order: -1) @connection(key: "messages") {
              pageInfo {
                hasNextPage
                hasPreviousPage
              }
              edges {
                cursor
                node {
                  id
                  messageId
                  conversationId
                  senderId
                  content
                  created_at
                  onFlight @client
                  __typename
                }
              }
            }
          }
        `,
        data: Object.assign(
          {},
          {
            ...convo,
            messages: {
              ...convo.messages,
              edges: [newMessage, ...convo.messages.edges]
            }
          }
        )
      });
    }
  });

  const onPressSend = useCallback(() => {
    changeText('');
    return sendMessage();
  }, [content, conversationId, changeText]);

  return (
    <View style={{ ...styles.footer }}>
      <TextInput
        keyboardAppearance="dark"
        multiline
        returnKeyType="next"
        value={content}
        onChangeText={changeText}
        style={styles.input}
      />
      <TouchableOpacity disabled={!content} onPress={onPressSend}>
        <MaterialIcon
          style={{ ...styles.send, color: 'blue' }}
          name="send"
          size={20}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f4',
    paddingBottom: 20,
    borderStyle: 'solid',
    borderTopWidth: 1,
    borderTopColor: 'gray'
  },
  input: {
    marginVertical: 10,
    paddingVertical: 5,
    borderRadius: 10,
    fontSize: 18,
    paddingHorizontal: 18,
    flex: 1,
    lineHeight: 20,
    backgroundColor: '#ffffff'
  },
  send: {
    alignSelf: 'center',
    color: 'lightseagreen',
    fontWeight: 'bold',
    padding: 16
  }
});

export default ConversationInput;
