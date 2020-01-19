import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome';
import StyledView from './StyledView';
import StyledText from './StyledText';
import moment from 'moment';

const MessageRow = ({ onFlight, content, self, created_at }) => {
  console.log('moment', created_at);
  if (onFlight) {
    console.log('message is not delivered yet.');
  }
  return (
    <StyledView
      paddingX={2}
      paddingY={1}
      margin={1}
      flex={1}
      flexDirection={'row'}
      borderRadius={4}
      backgroundColor={self ? 'blue' : 'gray'}
      alignSelf={self ? 'flex-end' : 'flex-start'}
    >
      <StyledView flexDirection={'column'}>
        <StyledText style={{ textAlign: 'left' }} ml={10}>
          {content}
        </StyledText>
        <StyledText style={{ textAlign: 'right' }}>
          {self && onFlight ? <Icon name={"clock-o"} size={16} /> : null}
          {moment(created_at, 'x').format('LT')}
        </StyledText>
      </StyledView>
    </StyledView>
  );
};

export default MessageRow;
