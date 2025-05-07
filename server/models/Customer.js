import mongoose from 'mongoose';

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  spend: { type: Number, default: 0 },
  visits: { type: Number, default: 0 },
  lastOrderDate: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.model('Customer', CustomerSchema);
