import mongoose, { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  verified: { type: Boolean, default: true },
  verificationToken: { type: String, default: null },
  password: { type: String, required: true },
  myRankings: [{
    destinationId: { type: Schema.Types.ObjectId, ref: 'Destination' },
    personalElo: { type: Number, default: 1000 },
    isSettled: { type: Boolean, default: false }, // for duel notifications and such
    timesDuelled: { type: Number, default: 0 }, // for choosing opponents/undueled notifications 
    createdAt: { type: Date, default: Date.now }
  }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

// checks if the model exists, otherwise creates it
const User = models.User || model('User', userSchema);
export default User;

