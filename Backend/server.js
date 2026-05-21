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

app.use(express.static(__dirname));

app.get("/",(req,res)=>{

    res.sendFile(
        path.join(__dirname,"index.html")
    );

});

/*
ROOMS
*/
let rooms = {};

/*
SOCKET
*/
io.on("connection",(socket)=>{

    console.log("Player Connected");

    /*
    JOIN ROOM
    */
    socket.on("joinRoom",(data)=>{

        const roomId =
        data.room || "GLOBAL";

        socket.join(roomId);

        socket.roomId = roomId;

        if(!rooms[roomId]){
            rooms[roomId] = {};
        }

        rooms[roomId][socket.id] = {

            id:socket.id,

            name:data.name || "Player",

            x:Math.random()*2000,

            y:Math.random()*1200,

            rotation:0,

            health:100,

            kills:0

        };

        console.log(
            data.name +
            " joined " +
            roomId
        );

    });

    /*
    MOVE
    */
    socket.on("move",(data)=>{

        const roomId = socket.roomId;

        if(
            roomId &&
            rooms[roomId] &&
            rooms[roomId][socket.id]
        ){

            rooms[roomId][socket.id].x =
            data.x;

            rooms[roomId][socket.id].y =
            data.y;

            rooms[roomId][socket.id].rotation =
            data.rotation;

        }

    });

    /*
    SHOOT
    */
    socket.on("shoot",(data)=>{

        socket.to(socket.roomId).emit(
            "playerShoot",
            data
        );

    });

    /*
    PLAYERS UPDATE
    */
    const interval = setInterval(()=>{

        const roomId = socket.roomId;

        if(roomId && rooms[roomId]){

            io.to(roomId).emit(
                "players",
                rooms[roomId]
            );

        }

    },40);

    /*
    DISCONNECT
    */
    socket.on("disconnect",()=>{

        const roomId = socket.roomId;

        if(
            roomId &&
            rooms[roomId] &&
            rooms[roomId][socket.id]
        ){

            delete rooms[roomId][socket.id];

        }

        clearInterval(interval);

        console.log("Player Left");

    });

});

const PORT =
process.env.PORT || 3000;

server.listen(PORT,()=>{

    console.log(
        "Server Running On " + PORT
    );

});
