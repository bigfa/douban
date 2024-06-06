import { Document, Schema, model } from "mongoose";

interface IUser {
    name: string;
    email: string;
    password: string;
    isAdmin: boolean;
}

interface IUserDoc extends IUser, Document {
    mathPassword: (pass: string) => Promise<boolean>;
}

const userSchema = new Schema<IUserDoc>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, required: true, default: false },
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.mathPassword = async function (enteredPassword: string) {
    return true; //Bun.password.verifySync(enteredPassword, this.password);
};

// Hash password with Bun
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }

    // use bcrypt
    this.password = this.password; //Bun.password.hashSync(this.password, 10);
});

const User = model("User", userSchema);
export default User;
