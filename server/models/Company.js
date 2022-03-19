const mongoose = require("mongoose");
const { Schema } = mongoose;

const CompanySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  about: String,
  address: String,
  companyLead: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Company", CompanySchema);
