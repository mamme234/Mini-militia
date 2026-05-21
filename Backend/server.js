const express = require("express");
const http = require("http");
const path = require("path");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server,{
    cors:{
        origin:"*"
    }
});

app.use(cors());

/*
SERVE FRONTEND
*/
app.use(express.static(path.join(__dirname,"../Frontend")));

/*
MAIN PAGE
*/
app.get("/",(req,res)=>{
    res.sendFile(path.join(__dirname,"../Frontend/index.html"));
});

/*
PLAYERS
*/
let players = {};

/*
SOCKET CONNECTION
*/
io.on("connection",(socket)=>{

    console.log("Player Connected:",socket.id);

    players[socket.id] = {
        x:300,
        y:300,
        health:100,
        kills:0,
        name:"Player"
    };

    /*
    PLAYER JOIN
    */
    socket.on("join",(data)=>{

        if(players[socket.id]){
            players[socket.id].name = data.name || "Player";
        }

    });

    /*
    PLAYER MOVE
    */
    socket.on("move",(data)=>{

        if(players[socket.id]){

            players[socket.id].x = data.x;
            players[socket.id].y = data.y;

        }

    });

    /*
    PLAYER SHOOT
    */
    socket.on("shoot",(data)=>{

        socket.broadcast.emit("playerShoot",{
            x:data.x,
            y:data.y,
            tx:data.tx,
            ty:data.ty
        });

    });

    /*
    SEND PLAYERS
    */
    const interval = setInterval(()=>{

        io.emit("players",players);

    },50);

    /*
    DISCONNECT
    */
    socket.on("disconnect",()=>{

        console.log("Player Left:",socket.id);

        delete players[socket.id];

        clearInterval(interval);

    });

});

/*
PORT
*/
const PORT = process.env.PORT || 3000;

server.listen(PORT,()=>{

    console.log("Server Running On Port " + PORT);

});
