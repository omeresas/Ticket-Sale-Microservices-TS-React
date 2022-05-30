import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const signupCookie = () => {
  // Build a JWT payload
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: "test@example.com",
  };

  // Create the JWT
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object
  const session = {
    jwt: token,
  };

  // Turn that session into JSON
  const sessionJson = JSON.stringify(session);

  // Take JSON and encode as Base64
  const encodedString = Buffer.from(sessionJson).toString("base64");

  // Return a string that is the cookie with the encoded data
  return [`session=${encodedString};`];
};

export { signupCookie };
