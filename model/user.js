let { Schema, model } = require("mongoose");

const userSchema = new Schema({
  _id: {
    required: true,
    type: String,
  },
  fname: {
    required: true,
    type: String,
  },
  sname: {
    type: String,
  },
  password: {
    required: true,
    minLength: 3,
    maxLength: 16,
    type: String,
  },

  groupIds: {
    type: [Schema.Types.ObjectId],
    ref: "group",
  },
});

const groupSchema = new Schema({
  _id: {
    required: true,
    type: String,
  },
  name: {
    required: true,
    type: String,
  },
  userIds: {
    type: [Schema.Types.ObjectId],
    ref: "user",
  },
});

module.exports = {
  User: model("user", userSchema),
  Group: model("group", groupSchema),
};
