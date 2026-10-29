import User from "../models/UserModel.js";
import Membership from "../models/MembershipModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import axios from "axios";

export const register = async (req, res) => {
  const { username, email, password, github_id, avatarUrl } = req.body;

  if (!username || !email) {
    return res
      .status(400)
      .json({ message: "Username and email fields are required" });
  }

  if (!github_id && !password) {
    return res
      .status(400)
      .json({ message: "Password is required for standard registrations" });
  }

  try {
    const exist = await User.findOne({ email: email.toLowerCase() });
    if (exist) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const userData = {
      username: username,
      email: email.toLowerCase(),
      github_id: github_id || undefined,
      avatarUrl: avatarUrl || undefined,
    };

    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    const newUser = await User.create(userData);

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: github_id
        ? "Registration via GitHub successful!"
        : "Standard registration successful!",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        memberships: await Membership.find({ userId: newUser._id })
          .select("teamId role")
          .lean(),
        avatarUrl: newUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during registration" });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password fields are required" });
  }
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.password) {
      return res.status(400).json({
        message: "This user registered via GitHub. Please use GitHub login.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const [token, memberships] = await Promise.all([
      Promise.resolve(
        jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        }),
      ),
      Membership.find({ userId: user._id }).select("teamId role").lean(),
    ]);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        memberships,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during login" });
  }
};

export const redirectToGitHub = (req, res) => {
  const clientID = process.env.GITHUB_CLIENT_ID;
  // Request repo scope so the returned token can be used to validate/connect repositories
  const scopes = encodeURIComponent("user:email repo");
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientID}&scope=${scopes}`;

  return res.redirect(githubAuthUrl);
};

export const githubCallback = async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res
      .status(400)
      .json({ message: "Authorization code missing from GitHub" });
  }

  try {
    const tokenResponse = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      },
      {
        headers: { accept: "application/json" },
      },
    );

    const githubAccessToken = tokenResponse.data.access_token;

    const userResponse = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `token ${githubAccessToken}` },
    });

    const {
      id: github_id,
      login: username,
      avatar_url,
      email,
    } = userResponse.data;

    const finalEmail = email || `${username}@://temporary.com`;

    let user = await User.findOneAndUpdate(
      { github_id: github_id.toString() }, // Recherche par github_id
      {
        username: username,
        avatarUrl: avatar_url,
        email: finalEmail.toLowerCase(),
        github_token: githubAccessToken,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000,
    });

    const memberships = await Membership.find({ userId: user._id })
      .select("teamId")
      .lean();
    const dest = memberships.length ? "/dashboard" : "/onboarding";

    return res.redirect(
      `${process.env.FRONTEND_URL || "https://metrics-xs4x.onrender.com"}${dest}`,
    );
  } catch (error) {
    console.error("GitHub OAuth Error:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL || "https://metrics-xs4x.onrender.com"}/login?error=oauth_failed`,
    );
  }
};

export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
    return res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error during logout" });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res
        .status(200)
        .json({
          success: true,
          message:
            "If an account with that email exists, we have sent a password reset link.",
        });
    }

    if (!user.password && user.github_id) {
      return res
        .status(400)
        .json({
          message:
            "This account uses GitHub for login. You cannot reset a password for it.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,
        message:
          "If an account with that email exists, we have sent a password reset link.",
      });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
