import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    lastName: {
      type: String,
      required: true,
      min: 2,
      max: 50,
    },
    email: {
      type: String,
      required: true,
      max: 50,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      min: 5,
    },
    picturePath: {
      type: String,
      default: "",
    },
    friends: {
      type: Array,
      default: [],
    },
    location: String,
    savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    phone: {
      type: String,
      required: false,
    },
    birthday: {
      type: Date,
      required: false,
    },
    gender: {
      type: String,
      enum: ["Male", "Female"],
      required: false,
    },
    role: {
      type: String,
      enum: ["student", "teacher"],
      required: true,
      default: "student", 
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
