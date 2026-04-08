import mongoose, { Schema, model, models } from 'mongoose';

const postSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  destinationId: { type: Schema.Types.ObjectId, ref: 'Destination', required: true },
  caption: { type: String, maxlength: 2200 },
  ratingSnapshot: {
    newRank: Number,
  },
  createdAt: { type: Date, default: Date.now }
});

// checks if the model exists, otherwise creates it
const Post = models.Post || model('Post', postSchema);
export default Post;