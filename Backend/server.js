const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
cors:{
origin:"*"
}
});

app.use(cors());

app.use(express.static(__dirname));

let players = {};

io.on("connection",(socket)=>{

console.log("Player Connected");

players[socket.id] = {
x:300,
y:300,
health:100,
kills:0
};

socket.on("join",(data)=>{

players[socket.id].name = data.name;

});

socket.on("move",(data)=>{

if(players[socket.id]){

players[socket.id].x = data.x;
players[socket.id].y = data.y;

}

});

socket.on("shoot",(data)=>{

socket.broadcast.emit("playerShoot",data);

});

socket.on("disconnect",()=>{

delete players[socket.id];

console.log("Player Left");

});

setInterval(()=>{

io.emit("players",players);

},50);

});

const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{

console.log("Server Running On Port " + PORT);

});
