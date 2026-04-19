import mongoose, { Schema, model, models } from 'mongoose';

const destinationSchema = new Schema({
  // core identity from MapBox — set once upon creation, never changed
  mapboxId: { type: String, required: true, unique: true },
  placeName: { type: String },
  country: { type: String },

  // city cover photo — sourced from unsplash
  photoUrl: { type: String, default: null },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] },
  },

  // aggregated post data — updated when users create/delete posts
  postCount: { type: Number, default: 0 },
  tags: [{
    label: { type: String },
    count: { type: Number, default: 0 }
  }],


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