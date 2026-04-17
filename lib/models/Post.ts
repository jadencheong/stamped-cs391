import mongoose, { Schema, model, models } from 'mongoose';
import { VALID_TAGS } from '@/lib/tags';

const postSchema = new Schema({
  userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  destinationId: {type: Schema.Types.ObjectId, ref: 'Destination', required: true},
  tags: {
    type: [{type: String, enum: VALID_TAGS}],
    validate: {
      validator: (v: string[]) => v.length >= 1 && v.length <= 3,
    message: 'A post must have between 1 and 3 tags.'
  }
},
  caption: { type: String, maxlength: 2200 },
  ratingSnapshot: {
    newRank: Number,
  },
  createdAt: { type: Date, default: Date.now }
});

// make one post per user per city
postSchema.index({ userId: 1, destinationId: 1 }, { unique: true });

// checks if the model exists, otherwise creates it
const Post = models.Post || model('Post', postSchema);
export default Post;