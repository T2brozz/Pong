const http = require('http');
const express = require('express');
const url = require('url');
const fs = require('fs');
const WebSocket = require('ws');

var names_con = [];
var names_dis = [];
var lookup_dis = {};
var lookup_con = {};
const port = 8080;
const app = express();
const server = http.createServer(app);

app.use(express.static('public'));

server.listen(process.env.PORT || port, () => {
    console.log(`Server started on port ${server.address().port}`)
});
const wss = new WebSocket.Server({
  server
});


wss.on('connection', function connection(ws) {
  console.log('Verbindung von Client');

  ws.on('message', function incoming(data) {
    //  console.log("Neue Nachricht: " + data);
    var obj = JSON.parse(data);
    switch (obj.id) {

      case "Display":
        while (true) {
          var name = Math.floor(Math.random() * (9999 - 1000) + 1000);
          if (names_dis.includes(String(name)) !== true) {


            lookup_dis[String(name)] = ws;
            names_dis.push(String(name));
            lookup_dis[String(name)].send(JSON.stringify({
              id: "LOGIN",
              name: String(name)
            }));

            console.log("New Display : " + name);
            break;
          }
        }
        break;
      case "CONTROLLER":
        if (typeof obj.name !== "undefined" && obj.name != "" && names_dis.includes(obj.name)) {
          if (names_con.includes(obj.name + obj.orien)) {
            if (obj.orien == "_right") {
              if (names_con.includes(obj.name + "_left")) {
                lookup_con["temp"] = ws;
                lookup_con["temp"].send(JSON.stringify({
                  id: "CONTROLLER",
                  orien: "nothing"
                }));
                delete lookup_con["temp"];
              } else {
                names_con.push(obj.name + "_left");
                lookup_con[(obj.name + "_left")] = ws;
                lookup_con[(obj.name + "_left")].send(JSON.stringify({
                  id: "CONTROLLER",
                  orien: "_left"
                }));
                //___________________
                lookup_dis[obj.name].send(JSON.stringify({
                  id: "CONTROLLER CONNECT",
                  orien: "_left"
                }));
                console.log(obj.name + "_left");
              }
            } else {
              if (names_con.includes(obj.name + "_right")) {
                lookup_con["temp"] = ws;
                lookup_con["temp"].send(JSON.stringify({
                  id: "CONTROLLER",
                  orien: "nothing"
                }));
                delete lookup_con["temp"];
              } else {
                names_con.push(obj.name + "_right");
                lookup_con[(obj.name + "_right")] = ws;
                lookup_con[(obj.name + "_right")].send(JSON.stringify({
                  id: "CONTROLLER",
                  orien: "_right"
                }));
                //______________________
                lookup_dis[obj.name].send(JSON.stringify({
                  id: "CONTROLLER CONNECT",
                  orien: "_right"
                }));
                console.log(obj.name + "_right");
              }
            }

          } else {
            names_con.push(obj.name + obj.orien);
            lookup_con[(obj.name + obj.orien)] = ws;
            lookup_con[(obj.name + obj.orien)].send(JSON.stringify({
              id: "CONTROLLER",
              orien: obj.orien
            }));
            console.log(obj.name + obj.orien);
            //___________________
            lookup_dis[obj.name].send(JSON.stringify({
              id: "CONTROLLER CONNECT",
              orien: obj.orien
            }));
          }
        } else {
          lookup_con["temp"] = ws;
          lookup_con["temp"].send(JSON.stringify({
            id: "CONTROLLER",
            orien: "nothing"
          }));
          delete lookup_con["temp"];
        }
        break;
      case "GO":
        if (typeof obj.name !== "undefined" && obj.name != "" && names_dis.includes(obj.name) && names_con.includes(obj.name + "_right") && names_con.includes(obj.name + "_right")) {
          lookup_con[obj.name + "_left"].send(JSON.stringify({
            id: "GO"
          }));
          lookup_con[obj.name + "_right"].send(JSON.stringify({
            id: "GO"
          }));
        } else {
          console.log("Error");
        }
        break;
      case "GAME":
        if (typeof obj.name !== "undefined" && obj.name != "" && names_dis.includes(obj.name)) {
          lookup_dis[obj.name].send(JSON.stringify({
            id: "GAME",
            orien: obj.orien,
            y: obj.y
          }))
        }
        break;



      default:
        console.log("Neue Nachricht: " + data);

    } //switch


  });


});
