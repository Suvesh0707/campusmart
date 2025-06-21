import mongoose from 'mongoose';
const { Schema, model } = mongoose;

const ratingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String }
}, { _id: false }); // no _id for sub-documents

const productSchema = new Schema({
  title: String,
  price: Number,
  description: String,
  condition: String,
  category: String,
  images: [String],
  seller: { type: Schema.Types.ObjectId, ref: 'User' },
  location: String,
  sold: { type: Boolean, default: false },
  ratings: [ratingSchema] // ⭐ Added here
}, { timestamps: true });

const Product = model('Product', productSchema);
export default Product;
