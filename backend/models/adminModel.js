import mongoose from "mongoose";

const { Schema } = mongoose;

const adminSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: { type: String, required: true }, // hashed
  role: { type: String, default: "admin" },
  blockchainAddress: {
    type: String,
    required: true, // optional at creation; you can make required: true if desired
    trim: true,
    validate: {
      validator: function (v) {
        // basic eth address check: starts with 0x and 40 hex chars
        return !v || /^0x[a-fA-F0-9]{40}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Ethereum address!`,
    },
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const adminModel = mongoose.model("Admin", adminSchema);

export default adminModel;
