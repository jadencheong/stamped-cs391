import mongoose, { Schema, model, models } from 'mongoose';

const destinationSchema = new Schema({
  name: { type: String, required: true },
  // enum is the only values we're "allowing" the category to be
  category: { type: String, enum: ['City', 'Nature', 'Resort', 'Other'], default: 'City' },
  globalTotalScore: { type: Number, default: 1000 },
  timesDuelled: { type: Number, default: 0 },
  globalAverageScore: { type: Number, default: 1000 },
});

// checks if the model exists, otherwise creates it
const Destination = models.Destination || model('Destination', destinationSchema);
export default Destination;