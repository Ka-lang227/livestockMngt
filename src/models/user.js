const crypto = require('crypto');
const mongoose = require('mongoose');
const Validator = require('validator.js');
const Assert = Validator.Assert;
const bcrypt = require('bcryptjs');


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'users email is required'],
      unique: true,
      lowercase: true,
      validate: {
        validator: function(value) {
          // Email regex validation
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        message: 'Please provide a valid email'
      }
    },
    role: {
      type: String,
      required: [true, 'A user must have a role'],
      enum: ['admin', 'manager', 'worker'],
      default: 'worker',
    }, 
    password: {
      type: String,
      required: [true, 'User password is required to access system'],
      minlength: 8,
      select: false 
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Please confirm your password'],
      validate: {
        // This only works on CREATE and SAVE
        validator: function(el) {
            return el === this.password; // Check if password and passwordConfirm match
        },
        message: 'Passwords are not the same!'
      }
    },
    passwordChangedAt: Date, 
    passwordResetToken: String,
    passwordResetExpires: Date,
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationToken: String,
    verificationExpires: Date,
    active: {
        type: Boolean, 
        default: true,
        select: false // Do not return active status by default
    }
  }
);

//Setup pre-save middleware to check if password was modified and to hash password
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);

  this.passwordConfirm = undefined;

  next();
})

userSchema.pre('save', function(next) {
  if(!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

//Instance methods to (1) check if password is correct, (2) if the password was changed and (3) create password reset token to change password 
userSchema.methods.correctPassword = async function( 
    candidatePassword, 
    userPassword
  ) {

  return await bcrypt.compare(candidatePassword, userPassword);

};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};


userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 15 * 60 * 1000;

  return resetToken;
};

// create verification token 
userSchema.methods.createVerificationToken = function() {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.verificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};


const User = mongoose.model('User', userSchema);

module.exports = User;