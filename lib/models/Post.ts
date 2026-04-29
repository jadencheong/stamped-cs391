import mongoose, { Schema, model, models } from 'mongoose';
import { VALID_TAGS } from '@/lib/tags';

const postSchema = new Schema({
  // 'user' allows populate() to swap this Id for the user document
  userId: {type: Schema.Types.ObjectId, ref: 'User', required: true},
  // 'destination' allows populate() to swap this id for the destination document
  destinationId: {type: Schema.Types.ObjectId, ref: 'Destination', required: true},
  // tags are validated against VALID_TAGS using the list we agreed upon
  // minimum of 1 tag is required with a max of 3, this is done here and in the api route
  tags: {
    type: [{type: String, enum: VALID_TAGS}],
    validate: {
      validator: (v: string[]) => v.length >= 1 && v.length <= 3,
    message: 'A post must have between 1 and 3 tags.'
  }
},
  // the optional note is capped at 220 characters
  caption: { type: String, maxlength: 2200, default: '' },
  // this will store the Cloudinary URLs in mongo, the image files are actual on Cloudinary
  // Heic files are turned into jpg by Cloudinary before their url is stored
  images: [{ type: String }],
  // this store the rank position assigned after duel comparison
  // set by duel after the post is made
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