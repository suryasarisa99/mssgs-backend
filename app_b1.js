const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const cors = require("cors");
const io = socketIo(server, {
  cors: {
    methods: "POST, DELETE, GET, PUT, PATCH",
    origin: "http://localhost:3000",
    // origin: "*",
  },
});
const { User, Group } = require("./model/user");

require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    // origin: "*",
    allowedHeaders: "Content-Type",
    methods: "POST, GET, DELETE, PUT, PATCH",
  })
);
let socket;
io.on("connection", (socket) => {
  console.log("Connected");
  socket = socket;
  socket.on("message", (data) => {
    // console.log(`Recived Message: ${message}`);
    socket.broadcast.emit("message-sent", `from ${data.from}: ${data.mssg}`);
  });
  socket.on("p-message", (data) => {
    // console.log(`Recived Message: ${message}`);
    socket.to(data.to).emit("message-sent", `from ${data.from}: ${data.mssg}`);
  });
});

app.post("/new-user", async (req, res) => {
  const x = User.findById(user.id);
  if (x) return res.send({ mssg: "User Already Exists" });
  let u = new User({
    _id: user.id,
    password: user.password,
    name: user.name,
  });
  socket.join(u._id);
  await u.save();
});

app.post("/sign-up", (req, res) => {});

app.get("/", (req, res) => {
  res.send("hello surya");
});

app.get("/socket.io/*", (req, res) => {
  res.send("this is socket io");
});

server.listen(3001);
