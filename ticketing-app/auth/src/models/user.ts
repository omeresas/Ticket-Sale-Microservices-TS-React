import mongoose from "mongoose";
import { PasswordManager } from "../services/password-manager";

// an interface that describes the propoerties that are required to create a new User
interface userAttrs {
  email: string;
  password: string;
}

// an interface that describes the properties a User document has
interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
}

// an interface that describes the properties a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: userAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        delete ret.password;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  // "this" refers to the document that is being saved

  // will be true when "this" is created for the first time or password attribute is modified
  if (this.isModified("password")) {
    const hashedPassword = await PasswordManager.toHash(this.get("password"));
    this.set("password", hashedPassword);

    // we need to call the given call-back function after calling Schema.pre()
    done();
  }
});

userSchema.statics.build = (attrs: userAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>("User", userSchema);

export { User };
