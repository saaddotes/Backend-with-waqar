import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import bcrypt from "bcrypt";

// DB jo kam
const uri =
  "mongodb+srv://cadetsaadsoomro:Dearshah25@cluster0.elusj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

mongoose
  .connect(uri)
  .then(() => console.log("DB connected successffully"))
  .catch((e) => console.log("Failed to connect with DB", e.message));

const UserSchema = new mongoose.Schema({
  email: { type: String, require: true, unique: true },
  password: { type: String, require: true },
});

const Users = mongoose.model("losers", UserSchema);
//  ------------------------

const app = express();

app.use(express.json());

app.use(cors());

app.get("/signup", (req, res) => {
  res.send("Hello World");
});

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and Password required.",
      error: "Error Occured",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Passsword must be greater then 6 chrs.",
      error: "Error Occured",
    });
  }

  const encryptedPassword = await bcrypt.hash(password, 2);
  console.log("encryptedPassword", encryptedPassword);

  try {
    const newUser = new Users({ email, password: encryptedPassword });
    await newUser.save();
    res.status(200).json({ message: "Signed in successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" + error.message });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and Password required.",
      error: "Error Occured",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      message: "Passsword must be greater then 6 chrs.",
      error: "Error Occured",
    });
  }

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found!" });
    }

    const isCorrect = await bcrypt.compare(password, user.password);

    console.log("isCorrect", isCorrect);

    if (!isCorrect) {
      return res.status(400).json({ message: "Incorrect Password" });
    }

    res
      .status(200)
      .json({
        message: "User found",
        user: { ...user.toObject(), password: "_" },
      });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

app.listen(4000, () => {
  console.log("Server is running at : http://localhost:4000");
});
