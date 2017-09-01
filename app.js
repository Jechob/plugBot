const PlugAPI = require('plugapi');

var bot = new PlugAPI({
  email: '',
  password: ''
});

const reconnect = () => bot.connect('new-plug-who-dis');
const MAX_SONG_LENGTH = 420; //In seconds
const BOT_ID = 30063770;

  //Variables
var userCount, waitlistPos, command, test, idByName;
var chatObj = {};
var userList = [];


/***************************************************************/
// Custom Bot Functions
/***************************************************************/

var makeChatObj = (data) => {
  chatObj.id = data.id;
  chatObj.username = data.from.username;
  chatObj.userId = data.from.id;
  chatObj.userRole = data.from.role;
  chatObj.message = data.message;
}

var chatCommand = () => {
  command = chatObj.message.slice(1);
  command = command.toLowerCase();
  command = command.split(" ");

  switch (command[0]) {
    case 'a':
    case 'add':
      if (chatObj.userRole >= 2) {
        if (!command[1]) bot.moderateAddDJ(chatObj.userId);
        else {
          idByName = getIdByName(command[1]);
          if (idByName !== -1) bot.moderateAddDJ(idByName);
          idByName = -1;
        }
      }
      break;
    case 'eta':
      if (!command[1]) getWaitlistPos();
      else bot.sendChat('Getting ETA of other users not yet supported.', 5);
      break;
    case 'grab':
      if (chatObj.userRole >= 2) botGrab();
      break;
    case 'meh':
      if (chatObj.userRole >= 4) botMeh();
      break;
    case 'r':
    case 'remove':
      if (chatObj.userRole >= 2) {
        if (!command[1]) bot.moderateRemoveDJ(chatObj.userId);
        else {
          idByName = getIdByName(command[1]);
          if (idByName !== -1) bot.moderateRemoveDJ(idByName);
          idByName = -1;
        }
      }
      break;
    case 's':
    case 'skip':
      if (chatObj.userRole >= 2) skipSong();
      break;
    case 'thomas':
      bot.sendChat('THOMAS🚂IS🚂A🚂TANK🚂ENGINE🚂NOT🚂A🚂TRAIN🚂TRAINS🚂ARE🚂THE🚂WHOLE🚂THING🚂HE🚂IS🚂JUST🚂THE🚂TANK🚂ENGINE🚂PART🚂');
      break;
    case 'woot':
      if (chatObj.userRole >= 4) botWoot();
      break;
    default:
      break;
  }
}

var getIdByName = (name) => {
  var userLower, inputLower;
  userList = bot.getUsers();
  inputLower = name.toLowerCase();

  for (var i = 0; i < userList.length; i++) {
    userLower = userList[i].username.toLowerCase();

    if (userLower.match(inputLower) !== null) return userList[i].id;
  }
  return -1;
}
var getWaitlistPos = () => {
  waitlistPos = bot.getWaitListPosition(chatObj.userId);

  if (waitlistPos === -1) bot.sendChat(`${chatObj.username} is not in the wait list.`);
  else bot.sendChat(`${chatObj.username} is position ${waitlistPos} in the wait list.`);
}

var botWoot = () => {
  bot.woot();
  console.log('---Voted Woot by Moderator---');
}
var botMeh = () => {
  bot.meh();
  console.log('---Voted Meh by Moderator---');
}
var botGrab = () => {
  bot.grab();
  console.log('---Bot Grabbed Current Song---');
}

var skipSong = () => {
  bot.moderateForceSkip();
  console.log(`---Song Skipped By Moderator---`);
  bot.sendChat('Song skipped by moderator!');
}
var skipByMeh = () => {
  bot.moderateForceSkip();
  bot.sendChat('Meh votes too high! Song skipped!');
}
var skipByLength = () => {
  bot.moderateForceSkip();
  bot.sendChat('Song skipped for being longer than 7 minutes.');
}

/***************************************************************/
// Bot Event Handlers
/***************************************************************/

  //Bot joins server
bot.on('roomJoin', (room) => {
  console.log(`---Joined ${room}---`);
  bot.sendChat('Memebot9000 Activated!', 4);
  userCount = bot.getUsers().length;
});
  //Auto-reconnect
bot.on('close', reconnect());
bot.on('error', reconnect());





  //User joins/leaves events
bot.on('userJoin', (data) => {
  bot.sendChat(`Welcome to the room, ${data.username}!`, 7);
  userCount = bot.getUsers().length;
});
bot.on('userLeave', () => {
  userCount = bot.getUsers().length;
});



  //On song advancement events
bot.on('advance', () => {
  if (bot.getTimeRemaining() >= MAX_SONG_LENGTH) skipByLength();
  else {
    bot.woot();
  }
});





  //Chat events
bot.on('chat', (data) => {
  makeChatObj(data);

    //Print chat
  if (data.type == 'emote') console.log(`${data.from} ${data.message}`);
  else console.log(`${data.id} -- ${data.from}: ${data.message}`);

  if (data.message[0] === '!') chatCommand();
});





  //Vote events
bot.on('vote', (data) => {

});
