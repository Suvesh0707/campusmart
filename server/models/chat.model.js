import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Who sent the message (user/buyer)
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Product being discussed
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },     // Buyer (sender)
  messages: [messageSchema] // Array of message objects
});

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
