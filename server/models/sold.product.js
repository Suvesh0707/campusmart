import mongoose from 'mongoose';

const SoldProductSchema = new mongoose.Schema({
  product: {
    type: Object, // stores the entire product details
    required: true,
  },
  buyer: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 👈 Added _id for buyer
    name: String,
    email: String,
    address: String,
    phone: String,
  },
  seller: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // seller userId
    name: String,
    email: String,
  },
  soldAt: {
    type: Date,
    default: Date.now,
  },
});

const SoldProduct = mongoose.model('SoldProduct', SoldProductSchema);
export default SoldProduct;
