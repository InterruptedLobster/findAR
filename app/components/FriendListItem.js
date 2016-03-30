import React, {
  Component,
  Image,
  Text,
  TouchableHighlight,
  View,
  StyleSheet
} from 'react-native';

import { Actions } from 'react-native-router-flux';

export default class FriendListItem extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { friend } = this.props;
    // const pic = friend.picture; TODO: Add picture and email
    console.log(friend.picture,'asdfasd')
    return (
      <TouchableHighlight 
        onPress={() => {
          this.props.onPress( friend );
          // TODO: And then make the friend list go away.
          Actions.pop();
        }}
      >
        <View style={style.container}>
          <Image
            source={{ uri: friend.picture }}
            style={style.picture}
          />
          <Text style={style.text}>
            {friend.name}
          </Text>
        </View>
      </TouchableHighlight>
    );
  }
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 4,
    margin: 4,
    padding: 6,
    flexDirection: 'row',
  },
  text: {
    alignSelf: 'center',
    fontSize: 24,
  },
  icon: {
    alignSelf: 'flex-start',
    margin: 4,
    borderWidth: 1,
    borderColor: '#000000',
  },
  picture: {
    height: 50,
    width: 50,
    alignSelf: 'flex-start',
  }
});
