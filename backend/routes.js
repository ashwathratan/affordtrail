import express from "express";
import bcrypt from "bcrypt";

const router = express.Router();
const users = []; // in-memory array to store users

// Register
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existing = users.find(user => user.email === email);
  if (existing) return res.status(400).send("User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, email, password: hashedPassword });

  res.status(201).json({ message: "User registered", users });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = users.find(user => user.email === email);
  if (!user) return res.status(404).send("User not found");

  const match = await bcrypt.compare(password, user.password);
  if (match) {
    res.send("Login successful");
  } else {
    res.status(401).send("Invalid credentials");
  }
});

export default router;
