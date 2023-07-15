const express = require("express");
const app = express();
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const session = require("express-session");
const { connect } = require("mongoose");
const cors = require("cors");

let x = 0;

const io = socketIo(server, {
  cors: {
    methods: "POST, DELETE, GET, PUT, PATCH",
    // origin: "http://localhost:3000",
    origin: "*",
    // credentials: true,
  },
});
const { User, Group } = require("./model/user");
async function load(socket) {
  try {
    // console.log(`socketId: ${socket.id}`);
    let users = await User.find();
    for (let user of users) {
      socket.join(user._id);
      console.log(`userId: ${user._id}`);
    }
    // console.log(users);
    // users.forEach((user) => {
    //   console.log(user);
    //   const socket = io.sockets.connected[user.id];
    //   if (socket) socket.join(user._id);
    // });
  } catch (err) {
    console.log(err);
  }
}
require("dotenv").config();

//  Middle Wares
connect("mongodb://localhost:27017/mssg")
  .then(() => {
    console.log("connected to Db");
  })
  .catch((err) => console.log(err));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.0.169:3000"],
    // origin: "*",
    allowedHeaders: "Content-Type, Authorization",
    methods: "POST, GET, DELETE, PUT, PATCH",
    credentials: true,
  })
);
app.use(
  session({
    secret: "my secret",
    saveUninitialized: false,
    resave: false,
  })
);

io.on("connection", async (socket) => {
  console.log("Connected");
  // if (x == 0) {
  //   await load(socket);
  //   x++;
  // }
  socket.join("global");

  socket.on("message", (data) => {
    console.log(`Recived Message: from:${data.from}, mssg:${data.mssg}`);
    socket.broadcast.emit("message", data);
  });
  socket.on("p-mssg", (data) => {
    console.log(`Recived Message: `, data);
    socket.join(data.to);
    socket.to(data.to).emit("p-mssg", data);
  });
  socket.on("signup", async (user) => {
    try {
      console.log(user);
      let x = await User.findById(user.id);
      console.log(x);
      if (x) console.log("user found");
      // if (x) return socket.emit("signup", "User Id Already Exists");
      const u = new User({
        _id: user.id,
        fname: user.fname,
        sname: user.sname,
        password: user.password,
      });
      // socket.join(u._id);
      await u.save();
      socket.broadcast.emit("signup", "new User Id Created");
    } catch (err) {
      console.log(err);
    }
  });
  socket.on("active", (id) => {
    socket.join(id);
  });
});

app.post("/login", async (req, res) => {
  try {
    let { id, password } = req.body;
    let x = await User.findById(id);
    let users = await User.find({ _id: { $ne: id } }, { _id: 1 });
    if (!x) return res.json({ mssg: "noUserFound" });
    if (x.password != password) return res.json({ mssg: "incorrectPassword" });
    req.session.user = id;
    console.log(`my id: ${req.session.user}`);
    res.json({ me: x, users });
  } catch (err) {
    console.log(err);
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("LogedOut");
  });
});

app.get("/", async (req, res) => {
  try {
    console.log(req.session.user);
    if (req.session.user) {
      let me = await User.findById(req.session.user);
      let users = await User.find(
        { _id: { $ne: req.session.user } },
        { _id: 1 }
      );
      return res.json({ me, users });
    } else return res.json({ mssg: "notLogined" });
  } catch (err) {
    console.log(err);
  }
});

app.get("/socket.io/*", (req, res) => {
  res.send("this is socket io");
});

server.listen(3001);
