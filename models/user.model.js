import bcrypt from "bcryptjs";
import { model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username already exists"],
      minLength: [3, "Username must be at least 3 characters long"],
      maxLength: [20, "Username must be at most 20 characters long"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      maxLength: [50, "Email must be at most 50 characters long"],
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [8, "Password must be at least 8 characters long"],
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    refreshToken: {
      type: String,
      default: null,
    }
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(this.password, salt);
  this.password = hashPassword;
});

userSchema.methods.comparePassword = async function (password) {
    console.log("upcoming password: ", password)
    console.log("current password: ", this.password)
    return bcrypt.compare(password, this.password);
};

const User = model("User", userSchema);

export default User;
