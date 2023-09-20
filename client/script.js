if (location.host.includes("localhost")) {
  // Load livereload script if we are on localhost
  document.write(
    '<script src="http://' +
      (location.host || "localhost").split(":")[0] +
      ':35729/livereload.js?snipver=1"></' +
      "script>"
  );
}

const backendUrl = window.location.origin
  .replace(/^http/, "ws")
  .replace(/^https/, "wss");
const socket = new WebSocket(backendUrl);

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!! DON'T TOUCH ANYTHING ABOVE THIS LINE !!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


const userId = generateUserId();

socket.addEventListener("open", async (event) => {
  console.log("WebSocket connected!");
  // TODO: create message object to transmit the user to the backend
  //const UserName = document.getElementById("userName").value;
  //socket.send(JSON.stringify({type: 'newUser', UserName }));
  //const user = " ";
  document.getElementById("username").value = user.name.first;
  const message = {
    type: "user",
    user: {
      id: userId,
      name: document.getElementById("username").value,
    },
  };
  socket.send(JSON.stringify(message));
});

socket.addEventListener("message", (event) => {
  const messageObject = JSON.parse(event.data);
  console.log("Received message from server: " + messageObject.type);
  switch (messageObject.type) {
    //case "ping":
    //  socket.send(JSON.stringify({ type: "pong", data: "FROM CLIENT" }));
    case "users":
      // TODO: Show the current users as DOM elements
      showUsers(messageObject.users)
      break;
    case "message":
      // TODO: Show new message as DOM element append to chat history
      showMessage(messageObject.message)
      break;
    default:
      console.error("Unknown message type: " + messageObject.type);
  }
});

function showUsers(users) {
  // TODO: Show the current users as DOM elements
  const usersElement = document.getElementById("users");
  usersElement.innerHTML = "";
  users.forEach((user) => {
    const userElement = document.createElement("div");
    userElement.innerHTML = "🟢 " + user.name;
    usersElement.appendChild(userElement);
  });
}

function showMessage(message) {
  // TODO: Show new message as DOM element append to chat history
  const messageElement = document.createElement("div");
  const innerMessageElement = document.createElement("div");
  const headerElement = document.createElement("span");
  const usernameElement = document.createElement("span");
  const timeElement = document.createElement("span");
  const messageTextElement = document.createElement("p");
  innerMessageElement.classList.add(
    "rounded-lg",
    "p-4",
    "inline-flex",
    "flex-col",
    "gap-2"
  );
  headerElement.classList.add("font-bold", "flex", "gap-2", "items-center");
  if (message.user.id === userId) {
    messageElement.classList.add("text-right", "self-end");
    innerMessageElement.classList.add("bg-green-500", "border-2", "border-green-400");
  } else {
    innerMessageElement.classList.add("bg-blue-500", "border-2", "border-blue-400");
  }
  usernameElement.innerHTML = message.user.name;
  timeElement.innerHTML = "um " + message.time;
  timeElement.classList.add("text-xs");
  headerElement.appendChild(usernameElement);
  headerElement.appendChild(timeElement);
  messageTextElement.innerHTML = message.message;
  innerMessageElement.appendChild(headerElement);
  innerMessageElement.appendChild(messageTextElement);
  messageElement.appendChild(innerMessageElement);
  document.getElementById("messages").appendChild(messageElement);
  messageElement.scrollIntoView();
}

socket.addEventListener("close", (event) => {
  console.log("WebSocket closed.");
});

socket.addEventListener("error", (event) => {
  console.error("WebSocket error:", event);
});

function changeUsername() {
  // TODO: Implement change username and forward new username to backend
 //userId = document.getElementById("login").value;
  const newUsername = document.getElementById("username").value;
  if (newUsername === "") return;
  const message = {
    type: "user",
    user: {
      id: userId,
      name: document.getElementById("username").value,
    },
  };
  socket.send(JSON.stringify(message));
}

function sendMessage() {
  // TODO get message from input and send message as object to backend
  const messageText = document.getElementById("message").value;
  if (messageText === "") return;
  const message = {
    type: "message",
    message: {
      user: {
        id: userId,
        name: document.getElementById("username").value,
      },
      message: messageText,
      time: new Date().toLocaleTimeString(),
    },
  }
  socket.send(JSON.stringify(message));
  document.getElementById("message").value = "";

}
function generateUserId() {
  var randomDigit = () => Math.floor(Math.random() * 10); 
  return (
    randomDigit() + randomDigit() +randomDigit() +"-" + randomDigit() + randomDigit() + "-" + randomDigit() + randomDigit()
  )
}
