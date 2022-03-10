const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { formatMessage , generateLocationMessage }= require('./utils/messages');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);


app.use(express.static(path.join(__dirname , 'public')));


const botName = 'ChatBox ';
//--------------------run when a client connects-------------------------------
io.on('connection', socket => {
        
    socket.on('joinRoom', ({username, room}) => {
        
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        socket.emit('message', formatMessage(botName,'Welcome to chatbox'));
    //-----------------------------here------------------------------------------
        socket.broadcast.to(user.room).emit('message',  formatMessage(botName,`${user.username} has joined the chat`));


            //send information of rooms and users...
            io.to(user.room).emit('roomUsers',{
                room : user.room,
                users : getRoomUsers(user.room)
            });
      

     
    
    //----------------------------listen for chatMessage---------------------------------------
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });


    //------------------------sending location-------------------------------------

    // socket.on('createLocationMessage', (coords) => {
    //     let user = getCurrentUser(socket.id);

    //     if(user){
    //     io.to(user.room).emit('message', formatMessage(user.username, `https://google.com/maps?q=${coords.lat},${coords.lng}`))
    //     }
    // })

   
    socket.on('sendLocation', (coords) => {
        io.emit('locationmessage',
            generateLocationMessage(`${user.username}`, `${coords.latitude}`, `${coords.longitude}`))
    })
    
    socket.on('disconnect',()=>{
        const user = userLeave(socket.id);

        if(user) {
            io.to(user.room).emit('message',  formatMessage(botName,`${user.username} has left the chat`));
        
        //-----------------------------send information of rooms and users...----------------------
        io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getRoomUsers(user.room)
        });
        
        }
        
    });
});


});

server.listen(5000, console.log('server is live on port 5000')
);