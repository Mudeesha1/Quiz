const bcrypt = require("bcrypt");
const Admin = require("../../../models/admin.model");
const { generateAdminTokenPair } = require("../../../managers/jwtManager");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildValidationErrors = (payload) => {
  const errors = {};

  if (!payload.identifier?.trim()) {
    errors.identifier = "Username or email is required.";
  }

  if (!payload.password) {
    errors.password = "Password is required.";
  }

  return errors;
};

const loginAdmin = async (req, res, next) => {
  try {
    const payload = {
      identifier: req.body.identifier ?? req.body.username ?? req.body.email,
      password: req.body.password,
    };

    const validationErrors = buildValidationErrors(payload);
    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        status: "fail",
        message: "Validation failed",
        fieldErrors: validationErrors,
      });
    }

    const identifier = payload.identifier.trim();
    const normalizedIdentifier = identifier.toLowerCase();
    const admin = await Admin.findOne({
      where: EMAIL_REGEX.test(normalizedIdentifier)
        ? { email: normalizedIdentifier }
        : { username: identifier },
    });

    if (!admin) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid admin credentials.",
        fieldErrors: {
          identifier: "Invalid admin credentials.",
        },
      });
    }

    const passwordMatches = await bcrypt.compare(payload.password, admin.password);
    if (!passwordMatches) {
      return res.status(401).json({
        status: "fail",
        message: "Invalid admin credentials.",
        fieldErrors: {
          identifier: "Invalid admin credentials.",
        },
      });
    }

    const tokens = generateAdminTokenPair(admin);

    return res.status(200).json({
      status: "success",
      message: "Admin login successful",
      data: {
        id: admin.id,
        admin_name: admin.admin_name,
        username: admin.username,
        email: admin.email,
        profile_url: admin.profile_url,
      },
      tokens,
    });
  } catch (error) {
    next(error);
  }
};

const registerAdmin = async (req, res, next) => {
  try {
    const { admin_name, username, email, password } = req.body || {};

    if (!admin_name?.trim() || !username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        status: "fail",
        message: "admin_name, username, email, and password are required.",
      });
    }

    const existingAdmin = await Admin.findOne({
      where: {
        $or: [{ username }, { email: email.toLowerCase() }],
      },
    });

    if (existingAdmin) {
      return res.status(409).json({
        status: "fail",
        message: "An admin with that username or email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const createdAdmin = await Admin.create({
      admin_name: admin_name.trim(),
      username: username.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
    });

    return res.status(201).json({
      status: "success",
      message: "Admin registered successfully",
      data: {
        id: createdAdmin.id,
        admin_name: createdAdmin.admin_name,
        username: createdAdmin.username,
        email: createdAdmin.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  loginAdmin,
  registerAdmin,
};
