import { LOG_IN, LOG_OUT, UPDATE_FRIENDS} from '../constants/constants.js';
import { ref } from '../lib/db/db.js';
import { Actions } from 'react-native-router-flux';
import _ from 'underscore';

export const logIn = (payload) => {
  return {
    type: LOG_IN,
    payload
  };
};

export const updateFriends = (payload) => {
  return{
    type: UPDATE_FRIENDS,
    payload
  };
};

//we have array of all friends but fb does not give photo on initial call, so we have another
//helper function that gets each users friends photo
function generateFriends(friends, token, callback) {
  let friendsArray = [];
  _.each(friends, function(friend, index) {
    let photoquery =  "https://graph.facebook.com/v2.3/"+friend.id+"?fields=picture,name&access_token="+token;
    fetch(photoquery)
    .then((response) => response.json())
    .then(function(responseData) {
      const {id, name} = responseData;
      let friendInfo = { id, name };
      friendInfo.picture = responseData.picture.data.url;
      friendsArray.push(friendInfo);

      //when index length is same as friends length
      if(index === friends.length-1){
        callback(friendsArray);
      }
    });
  });
}

export const firebase_check = (userCredentials) => {
  let {userId, token} = userCredentials;
  let api = "https://graph.facebook.com/v2.3/"+userId+"?fields=name,email,friends,picture&access_token="+token;
  let friendcall = "https://graph.facebook.com/v2.3/"+userId+"?fields=name,friends&access_token="+token;
  let friendsArray = [];
  function checkIfUserExists(userId, callback) {
    ref.once('value', function(snapshot) {
    let userExistsBool = snapshot.hasChild(userId);
      callback(userExistsBool);
    });
  }
  return(dispatch) => {
    checkIfUserExists(userId, (userExist) => {
      if(!userExist) {
        let userInfo={};
        userInfo.id = userId;
        //fetch the other info
        return fetch(api)
        .then((response) => response.json())
        .then((responseData)=> {
          userInfo.name = responseData.name;
          userInfo.email = responseData.email;
          userInfo.picture = responseData.picture.data.url;
          //pushes all gathereed infor to database
          let newUser = ref.child(userId).set(userInfo);
          //generates friends for new user
          generateFriends(responseData.friends.data, token, function(allFriends) {
            dispatch(updateFriends(allFriends));
          });
          //logs new user in
          dispatch(logIn(userInfo));
        });
      } else {
        //this logs in user in redux state based on their existing db info
        ref.child(userId).on("value", function(snapshot) {
          let found = snapshot.val();
          const { id, name, email, picture } = found;
          let obj = {name, email, id, picture};
          dispatch(logIn(obj));
        });
        //this api call to fb updates friends list
        return fetch(friendcall)
        .then((response) => response.json())
        .then((responseData) => {
          let friends = responseData.friends.data;
          generateFriends(friends, token, function(allFriends) {
            dispatch(updateFriends(allFriends));
          });
        });
      }
    });
  };
};

export const logOut = function () {
  return {
    type: LOG_OUT
  };
};
