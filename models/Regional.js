const mongoose = require('mongoose');

const regionalSchema = new mongoose.Schema({
  regionalCode: { type: Number, required: true },  // Código da regional
  name: { type: String, required: true },  // Nome da regional
});

module.exports = mongoose.model('Regional', regionalSchema);
