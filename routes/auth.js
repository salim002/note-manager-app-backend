import express from "express";
const router = express.Router();

import User from "../models/User.js";

import { body, validationResult } from "express-validator";
import bcrypt from "bcryptjs";
const JWT_SECRET = "Salimisagoodb$oy";
import jwt from "jsonwebtoken"
import fetchuser from "../middleware/fetchuser.js";

// ROUTE 1: create a User using: POST "api/auth/createuser". No login required
router.post('/createuser',[
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password must be atleast 5 characters").isLength({min: 5,
    }),
  ],
  async (req, res) => {
    let success=false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({success, errors: errors.array() });
    }
    try {
      // Check whether the user with this email exists already
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({success, error: "Sorry a user this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      // Creating a new user according to User schema (date is by default set)
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      // res.json(user);
      success=true;
      res.json({success, authToken });

      // Catch errors
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal Server error");
    }
  }
);

// ROUTE 2: Authenticate a User using: POST "api/auth/login". No login required
router.post('/login',[
    body("email", "Enter a valid email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    let success=false;
    // If there are errors, return Bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        success=false
        return res.status(400).json({ success, error: "Please try to login with correct credentials" });
      }
      const passwrodCompare = await bcrypt.compare(password, user.password);
      if (!passwrodCompare) {
        success=false
        return res.status(400).json({ success, error: "Please try to login with correct credentials" });
      }

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);
      success=true;
      res.json({ success, authToken });
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

// ROUTE 3: Get logged in user details: POST "api/auth/getuser". Login required
router.post('/getuser', fetchuser, async (req, res) => {
    try {
      userId = req.user.id;
      const user = await User.findById(userId).select("password");
      res.send(user);
    } catch (error) {
      console.log(error.message);
      res.status(500).send("Internal server error");
    }
  }
);

export default router;