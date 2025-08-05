import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google-login
export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Token is required." });
    }

    // Verify token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    if (!email) {
      return res
        .status(400)
        .json({ message: "Invalid Google token (no email)." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ name, email, picture, isVerified: false });
      await user.save();
    }

    // Set cookie with JWT
    const jwtToken = generateToken(user);
    // res.cookie("token", jwtToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "Lax",
    //   maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    // });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      secure: true, // must be true for SameSite=None
      sameSite: "None", // allows cross-origin cookies
      maxAge: 7 * 24 * 60 * 60 * 1000,
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

// GET /api/auth/me
export const getMe = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.status(200).json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    picture: req.user.picture,
    isVerified: req.user.isVerified,
  });
};

// POST /api/auth/logout
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
  });
  res.status(200).json({ message: "Logged out" });
};
