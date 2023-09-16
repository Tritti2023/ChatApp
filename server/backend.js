const WebSocket = require("ws");
const redis = require("redis");
let redisClient;

let clients = [];
let messageHistory = [];

// Intiiate the websocket server
const initializeWebsocketServer = async (server) => {
  redisClient = redis.createClient({
    socket: {
      host: process.env.REDIS_HOST || "localhost",
      port: process.env.REDIS_PORT || "6379",
    },
  });
  await redisClient.connect();

  const websocketServer = new WebSocket.Server({ server });
  websocketServer.on("connection", onConnection);
  websocketServer.on("error", console.error);
};

// If a new connection is established, the onConnection function is called
const onConnection = (ws) => {
  console.log("New websocket connection");
  ws.on("close", () => onClose(ws));
  ws.on("message", (message) => onClientMessage(ws, message));
  // TODO: Send all connected users and current message history to the new client
  ws.send(JSON.stringify({ type: "ping", data: "FROM SERVER" }));
};

// If a new message is received, the onClientMessage function is called
const onClientMessage = async (ws, message) => {
  const messageObject = JSON.parse(message);
  console.log("Received message from client: " + messageObject.type);
  switch (messageObject.type) {
    case "pong":
      console.log("Received from client: " + messageObject.data);
    case "user":
      // TODO: Publish all connected users to all connected clients
      clients = clients.filter((client) => client.ws !== ws);
      clients.push({ ws, user: messageObject.user });
      console.log("Number of clients: " + clients.length);
      redisClient.set(
        `user:${messageObject.user.id}`,
        JSON.stringify(messageObject.user)
      );
      redisClient.expire(
        `user:${messageObject.user.id}`,
        redisExpireTimeInSeconds
      );
      const message = {
        type: "pushUsers",
      };
      publisher.publish("newMessage", JSON.stringify(message));
      break;
    case "message":
      // TODO: Publish new message to all connected clients and save in redis
      //for (const client of clients) {
      //  client.}
      publisher.publish("newMessage", JSON.stringify(messageObject));
      break;
      case "newUser":
      console.log("New User", messageObject.userName);
      break;
    default:
      console.error("Unknown message type: " + messageObject.type);
  }
};

// If a connection is closed, the onClose function is called
const onClose = async (ws) => {
  console.log("Websocket connection closed");
  // TODO: Remove related user from connected users and propagate new list
  const client = clients.find((client) => client.ws === ws);
  if (!client) return;
  redisClient.del(`user:${client.user.id}`);
  const message = {
    type: "pushUsers",
  };
  publisher.publish("newMessage", JSON.stringify(message));
  clients = clients.filter((client) => client.ws !== ws);
};

const getMessageHistory = async () => {
  return await redisClient.get("messageHistory");
};

const setMessageHistory = async (messageHistory) => {
  await redisClient.set("messageHistory", messageHistory);
};

module.exports = { initializeWebsocketServer };
