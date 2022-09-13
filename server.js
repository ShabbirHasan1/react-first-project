import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

let wsConnections = [];
let activeConnections = {};

// Functions
function makeid(length) {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function getTime() {
  var today = new Date(),
    time =
      today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(),
    date =
      today.getFullYear() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getDate(),
    dateTime = `${date} ${time}`;
  return dateTime;
}

function ws_send_object(ws, object) {
  ws.send(JSON.stringify(object));
}

function connection(ws) {
  // New Client
  console.log("new client connected");
  if (!(ws in wsConnections)) {
    let k = makeid(12);
    let p = makeid(24);
    wsConnections.push(ws);
    activeConnections[String(wsConnections.length)] = {
      websocket: ws,
      user: k,
      password: p,
    };

    ws_send_object(ws, {
      register: "success",
      client: {
        client_id: wsConnections.length,
        client_user: k,
        client_pass: p,
      },
    });
  }

  setListners(ws);
}

function ws_findFromID(id) {
  return activeConnections[id];
}

function ws_sendmessage_with_id(id, messageObject) {
  let ws = ws_findFromID(id).websocket;
  ws_send_object(ws, messageObject);
}

function ws_message(ws, data) {
  console.log("received: %s", data);
  try {
    const messageObject = JSON.parse(data);
    if ("step" in messageObject && messageObject["step"] == "show_all") {
      console.log(wsConnections.length);
    }
    if ("step" in messageObject && messageObject["step"] == "admin") {
      activeConnections["admin"] = {
        'websocket': ws,
      };
      console.log("ADMIN SET");
    }
    if ("send" in messageObject && "user_id" in messageObject["send"]) {
      if (messageObject["send"]["user_id"] == "admin") {
        console.log("Send to admin");
        console.log(activeConnections['admin']['websocket'].readyState)
        if (
          activeConnections['admin']['websocket'].readyState === 1
        ) {
          ws_send_object(
            activeConnections['admin']['websocket'],
            {
              'type': 'new_message',
              'from': wsConnections.indexOf(ws)+1,
              'text': messageObject["send"]["message"]
            }
          );
        }
      } else {
        ws_sendmessage_with_id(
          messageObject["send"]["user_id"],
          messageObject["send"]["message"]
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

function ws_close(ws) {
  var index = wsConnections.indexOf(ws);
  console.log(index);
  if (index != -1) {
    wsConnections = wsConnections.splice(index, 1);
    delete activeConnections[String(index)];
  }
  console.log("User Closed!");
}
// ON CONNECTION
wss.on("connection", connection);

function setListners(ws) {
  ws.on("message", (d) => {
    ws_message(ws, d)
  });

  ws.on("close", ws_close);
}
