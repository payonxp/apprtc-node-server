/**
 * Manages a user in a chat session
 * @param isInitiator
 *  determines if the user is the initiator/host of
 *  the chat
 * @constructor
 */
Client = function(isInitiator) {
  var self = this;
  this.isInitiator = isInitiator;
  this.messages = [];
  this.inRoomId = null;
  this.startTime = null;
  this.addMessage = function(message) {
    self.messages.push(message);
  };

  this.clearMessages = function() {
    self.messages = [];
  };

  this.toString = function() {
    return '{ '+ self.isInitiator +', '+ self.messages.length +' }';
  };
};

/**
 * Manges a video chat session containing information about
 * the 2 users in a chat.
 * @constructor
 */
Room = function() {
  var self = this;
  var clientMap = {}; //map of key/value pair for client objects
  var createTime = null;
  this.records = [];
  var record = {
    userId: null,
    come: null,
    leave:null
  };

  this.getOccupancy = function() {
    var keys = Object.keys(clientMap);
    return keys.length;
  };

  this.hasClient = function(clientId) {
    return clientMap[clientId];
  };

  this.join = function(clientId, callback) {
    var clientIds = Object.keys(clientMap);
    var otherClient = clientIds.length > 0 ? clientMap[clientIds[0]] : null;
    var isInitiator = otherClient == null;
    var client = new Client(isInitiator);
    clientMap[clientId] = client;
    if (callback) callback(null, client, otherClient);
  };

  this.removeClient = function(clientId, callback) {
    record.come = clientMap[clientId].startTime;
    delete clientMap[clientId];
    var otherClient = clientId.length > 0 ? clientMap[clientId[0]] : null;
    record.userId = clientId;
    record.leave = new Date().toLocaleString();
    self.records[self.records.length] = record;
    callback(null, true, otherClient);
  };

  this.getClient = function(clientId) {
    return clientMap[clientId];
  };

  this.toString = function() {
    return JSON.stringify(Object.keys(clientMap));
  };

  this.getOtherMessage = function(clientId) {
    var clientIds = Object.keys(clientMap);
    if (clientIds[0] == clientId) {
      if (clientIds.length <= 1) {
        return [];
      } else {
        return clientMap[clientIds[1]].messages;
      }
    } else {
      return clientMap[clientIds[0]].messages;
    }
  }
};

/**
 * Manages a collection of rooms to maintain video chat sessions.
 * The purpose of this class is to allow overloading this class
 * to implement memcache or redis cluser for handling large scale
 * concurrent video chat sessions.
 * @constructor
 */
Rooms = function() {
  var self = this;
  var roomMap = {}; //map of key/value pair for room objects

  this.get = function(roomCacheKey, callback) {
    var room = roomMap[roomCacheKey];
    callback(null, room);
  };

  this.create = function(roomCacheKey, callback) {
    var room = new Room;
    roomMap[roomCacheKey] = room;
    room.createTime=new Date().toLocaleString();
    callback(null, room);
  };

  this.createIfNotExist = function(roomCacheKey, callback) {
    self.get(roomCacheKey, function(error, room) {
      if (error) {
        callback(error);
        return;
      }
      if (!room) {
        self.create(roomCacheKey, callback);
        console.log("create new room " + roomCacheKey);
      } else {
        callback(error, room);
      }
    });
  };

};

module.exports = Rooms;