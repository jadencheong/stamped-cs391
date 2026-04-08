import mongoose, { Schema, model, models } from 'mongoose';

const duelSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  winnerId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
  loserId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
  isDraw: { type: Boolean, default: false }, // crucial for places we rate about the same (if we want to implment that)
  
  // storing the "swing" for history/analytics
  // important to ranking as well 
  eloGain: Number, 
  eloLoss: Number,

  timestamp: { type: Date, default: Date.now }
});

// checks if the model exists, otherwise creates it
const Duel = models.Duel || model('Duel', duelSchema);
export default Duel;