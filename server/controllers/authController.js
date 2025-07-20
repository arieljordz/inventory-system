import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Generate token with user payload (not just userId)
const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      name: user.name,
      email: user.email,
      isVerified: user.isVerified,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const googleLogin = async (req, res) => {
  try {
    const { name, email, picture, password } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        picture,
        password,
        isVerified: false,
      });
      await user.save();
    }

    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      picture: user.picture,
      isVerified: user.isVerified,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({ message: "Google login failed" });
  }
};

export const getMe = (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json(decoded);
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
};
