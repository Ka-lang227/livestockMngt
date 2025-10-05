const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: [true, "An expense must have a description"],
      trim: true,
    },

    amount: {
      type: Number,
      required: [true, "An expense must have an amount"],
      min: [0, "Amount must be greater than or equal to 0"],
    },

    category: {
      type: String,
      enum: [
        "feed",
        "medicine",
        "labor",
        "utilities",
        "housing_maintenance",
        "transport",
        "other",
      ],
      default: "other",
    },

    date: {
      type: Date,
      default: Date.now,
    },

    livestock: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Livestock",
    },

    housing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Housing",
    },
    // If expenses are grouped into batches
    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
