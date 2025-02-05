const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

// Encryption helper functions
const encrypt = (text) => {
  const cipher = crypto.createCipher("aes-256-cbc", process.env.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

const decrypt = (encrypted) => {
  const decipher = crypto.createDecipher(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY
  );
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
      maxLength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      minLength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: "default-avatar.jpg",
    },
    phone: {
      type: String,
      required: [true, "Please enter your phone number"],
      trim: true,
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    passwordHistory: [
      {
        password: String,
        changedAt: Date,
      },
    ],
    passwordChangedAt: {
      type: Date,
      default: Date.now,
    },
    passwordExpiresAt: {
      type: Date,
      default: function () {
        // If password hasn't been changed, count from account creation date
        const startDate = this.passwordChangedAt || this.joinDate || new Date();
        return new Date(+startDate + 90 * 24 * 60 * 60 * 1000);
      },
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    accountLockUntil: Date,
    encryptedPhone: {
      type: String,
      select: false,
    },
    encryptedEmail: {
      type: String,
      select: false,
    },
    activeSessions: [
      {
        token: String,
        device: String,
        lastActive: Date,
        expiresAt: Date,
      },
    ],
    maxSessions: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt sensitive data before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("phone")) {
    this.encryptedPhone = encrypt(this.phone);
  }
  if (this.isModified("email")) {
    this.encryptedEmail = encrypt(this.email);
  }
  if (this.isNew) {
    // For new accounts, set initial password dates
    this.passwordChangedAt = this.joinDate;
    this.passwordExpiresAt = new Date(
      +this.joinDate + 90 * 24 * 60 * 60 * 1000
    );
  }

  if (!this.isModified("password")) {
    return next();
  }

  try {
    // Check password history
    if (this.passwordHistory && this.passwordHistory.length > 0) {
      const recentPasswords = this.passwordHistory.slice(-3);
      for (const historyEntry of recentPasswords) {
        const isMatch = await bcrypt.compare(
          this.password,
          historyEntry.password
        );
        if (isMatch) {
          throw new Error("Cannot reuse any of your last 3 passwords");
        }
      }
    }

    // Add current password to history before hashing new one
    if (this.passwordHistory) {
      if (this.passwordHistory.length >= 3) {
        this.passwordHistory.shift();
      }
      this.passwordHistory.push({
        password: this.password,
        changedAt: new Date(),
      });
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);

    // Update password change and expiry dates
    this.passwordChangedAt = new Date();
    this.passwordExpiresAt = new Date(
      +this.passwordChangedAt + 90 * 24 * 60 * 60 * 1000
    );

    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password is expired
userSchema.methods.isPasswordExpired = function () {
  return Date.now() >= this.passwordExpiresAt;
};

// Handle failed login attempts
userSchema.methods.handleFailedLogin = async function () {
  this.failedLoginAttempts += 1;

  if (this.failedLoginAttempts >= 5) {
    this.accountLockUntil = new Date(+new Date() + 15 * 60 * 1000); // Lock for 15 minutes
  }

  await this.save();
};

// Reset failed login attempts
userSchema.methods.resetFailedAttempts = async function () {
  this.failedLoginAttempts = 0;
  this.accountLockUntil = undefined;
  await this.save();
};

// Add session management methods
userSchema.methods.addSession = async function (token, device) {
  // Remove expired sessions
  this.activeSessions = this.activeSessions.filter(
    (session) => session.expiresAt > new Date()
  );

  // Check max sessions
  if (this.activeSessions.length >= this.maxSessions) {
    // Remove oldest session
    this.activeSessions.sort((a, b) => a.lastActive - b.lastActive);
    this.activeSessions.shift();
  }

  // Add new session
  this.activeSessions.push({
    token,
    device,
    lastActive: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  });

  await this.save();
};

userSchema.methods.removeSession = async function (token) {
  this.activeSessions = this.activeSessions.filter(
    (session) => session.token !== token
  );
  await this.save();
};

userSchema.methods.updateSessionActivity = async function (token) {
  const session = this.activeSessions.find((s) => s.token === token);
  if (session) {
    session.lastActive = new Date();
    await this.save();
  }
};

module.exports = mongoose.model("User", userSchema);
