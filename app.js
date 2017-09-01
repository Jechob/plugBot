const PlugAPI = require('plugapi');

var bot = new PlugAPI({
  email: '',
  password: ''
});

const reconnect = () => bot.connect('new-plug-who-dis');
const MAX_SONG_LENGTH = 420 //In seconds

  //Variables
var votes, userCount, voteRatio, waitlistPos, command;
var currentSong = bot.getMedia();
var chatObj = {};


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
    case 's':
    case 'skip':
      if (chatObj.userRole >= 2) skipSong();
      break;
    case 'woot':
      if (chatObj.userRole >= 4) botWoot();
      break;
    default:
      break;
  }
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
var updateVoteData = () => {
  userCount = bot.getUsers().length;
  voteRatio = Math.round(userCount * 0.4) * -1;
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
reconnect();
bot.on('roomJoin', (room) => {
  console.log(`---Joined ${room}---`);
  bot.sendChat('Memebot9000 Activated!', 4);
});
  //Auto-reconnect
bot.on('close', reconnect);
bot.on('error', reconnect);





  //User joins/leaves events
bot.on('userJoin', () => {
  bot.sendChat(`Welcome to the room, ${data.username}!`, 7);
  updateVoteData();
});
bot.on('userLeave', () => {
  updateVoteData();
});



  //On song advancement events
bot.on('advance', () => {
  if (bot.getTimeRemaining() >= MAX_SONG_LENGTH) skipByLength();
  else {
    votes = 0;
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

    //Skip song if 40% of audience votes meh
  if (data.v < 0) {
    votes += data.v;
  }
  if (votes <= voteRatio) {
    skipByMeh();
  }
});
