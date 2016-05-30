/**
 * Created by morroc on 16/3/15.
 */

/**
 * Manages a collection of clients
 * @constructor
 */
Clients = function () {
    var clientsMap = {};
    this.get = function(clientId, callback) {
        var client = clientsMap[clientId];
        callback(null, client);
    };

    this.add = function(client, clientId, roomId) {
        client.inRoomId = roomId;
        clientsMap[clientId] = client;
    };

    this.register =  function(client) {
        client.startTime = new Date().toLocaleString();
    };
};

module.exports = Clients;