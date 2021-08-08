const express = require("express");
const app = express();
const server = app.listen(3000);
const io = require("socket.io")(server);

app.use(express.static("public"));

io.on("connection", socket => {
  socket.on("score", score => {
    socket.broadcast.emit("score", score);
  });

  socket.on("level", level => {
    socket.broadcast.emit("level", level);
  });
  
});
