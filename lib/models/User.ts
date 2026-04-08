import mongoose, { Schema, model, models } from 'mongoose';

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  myRankings: [{
    destinationId: { type: Schema.Types.ObjectId, ref: 'Destination' },
    personalElo: { type: Number, default: 1000 },
    createdAt: { type: Date, default: Date.now }
  }]
});

// checks if the model exists, otherwise creates it
const User = models.User || model('User', userSchema);
export default User;

