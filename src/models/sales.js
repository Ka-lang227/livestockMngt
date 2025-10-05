const mongoose = require('mongoose');

const salesSchema = new mongoose.Schema({
  saleType: {
    type: String,
    required: [true, 'Sale type is required'],
    enum: {
      values: ['individual', 'batch'],
      default: 'individual',
      message: 'Invalid sale type'
    }
  },
  livestock: [
    {
      livestockId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Livestock", // Link to your Animal model
        required: true,
      },
      weight: Number,
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    required: [true, 'Sale date is required'],
    default: Date.now,
  },
  totalAmount: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Price must be a positive number'],

  },
  salesPerson: {
    type: String,
    required: [true, 'Sales person name is required '],
    trim: true
  },
  buyer: {
    type: {
      name: {
        type: String,
        required: [true, 'Buyer name is required'],
        trim: true
      },
      contact: {
        type: String,
        trim: true
      },
      businessType: {
        type: String,
        enum: {
          values: ['Individual', 'Farm', 'Butcher', 'Market', 'Other'],
          message: 'Invalid business type'
        }
      }, 
      address: {
        type: String, 
        trim: true
      }
    }
  },
  notes: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: {
      values: ['Cash', 'Card', 'Bank Transfer', 'Check', 'Other'],
      message: 'Invalid payment method'
    }
  }
});

// Middleware to auto-calc totalAmount
salesSchema.pre("save", function (next) {
  if (this.saleType === "individual" && this.animals.length === 1) {
    this.totalAmount = this.livestock[0].price;
  } else if (this.saleType === "batch") {
    this.totalAmount = this.livestock.reduce((sum, a) => sum + a.price, 0);
  }
  next();
});


module.exports = mongoose.model("Sales", salesSchema);