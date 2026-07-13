const bcrypt = require("bcrypt");
const Admin = require("../../../models/admin.model");

/**
 * GET /admin/settings/profile
 * Return the currently authenticated admin's profile.
 */
const getAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.auth?.sub || req.userId;
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({ status: "fail", message: "Admin not found." });
    }

    return res.status(200).json({
      status: "success",
      data: {
        id: admin.id,
        admin_name: admin.admin_name,
        username: admin.username,
        email: admin.email,
        profile_url: admin.profile_url,
        joined_at: admin.joined_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /admin/settings/profile
 * Update admin name, email, and optionally avatar (file upload).
 */
const updateAdminProfile = async (req, res, next) => {
  try {
    const adminId = req.auth?.sub || req.userId;
    const admin = await Admin.findByPk(adminId);

    if (!admin) {
      return res.status(404).json({ status: "fail", message: "Admin not found." });
    }

    const { admin_name, email } = req.body || {};

    if (admin_name !== undefined && admin_name.trim()) {
      admin.admin_name = admin_name.trim();
    }

    if (email !== undefined && email.trim()) {
      const emailLower = email.trim().toLowerCase();
      // Check for duplicates (excluding self)
      const existing = await Admin.findOne({ where: { email: emailLower } });
      if (existing && existing.id !== admin.id) {
        return res.status(409).json({ status: "fail", message: "That email is already in use by another admin." });
      }
      admin.email = emailLower;
    }

    if (req.file) {
      const UPLOAD_CONFIG = require("../../../config/upload.config");
      admin.profile_url = UPLOAD_CONFIG.getUrlPath("profiles", req.file.filename);
    }

    await admin.save();

    return res.status(200).json({
      status: "success",
      message: "Profile updated successfully.",
      data: {
        id: admin.id,
        admin_name: admin.admin_name,
        username: admin.username,
        email: admin.email,
        profile_url: admin.profile_url,
        joined_at: admin.joined_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /admin/settings/change-password
 * Validate current password, then update to new password.
 */
const changeAdminPassword = async (req, res, next) => {
  try {
    const adminId = req.auth?.sub || req.userId;
    const { current_password, new_password } = req.body || {};

    if (!current_password || !new_password) {
      return res.status(400).json({
        status: "fail",
        message: "current_password and new_password are required.",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        status: "fail",
        message: "New password must be at least 8 characters long.",
      });
    }

    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ status: "fail", message: "Admin not found." });
    }

    const matches = await bcrypt.compare(current_password, admin.password);
    if (!matches) {
      return res.status(401).json({
        status: "fail",
        message: "Current password is incorrect.",
      });
    }

    admin.password = await bcrypt.hash(new_password, 10);
    await admin.save();

    return res.status(200).json({
      status: "success",
      message: "Password changed successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/settings/openrouter-key
 */
const getOpenRouterKey = async (req, res, next) => {
  try {
    const adminId = req.auth?.sub || req.userId;
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ status: "fail", message: "Admin not found." });
    }
    return res.status(200).json({
      status: "success",
      data: {
        hasKey: !!admin.openrouter_key,
        openrouter_key: admin.openrouter_key || "",
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /admin/settings/openrouter-key
 */
const updateOpenRouterKey = async (req, res, next) => {
  try {
    const adminId = req.auth?.sub || req.userId;
    const { openrouter_key } = req.body || {};
    const admin = await Admin.findByPk(adminId);
    if (!admin) {
      return res.status(404).json({ status: "fail", message: "Admin not found." });
    }
    admin.openrouter_key = openrouter_key ? openrouter_key.trim() : null;
    await admin.save();
    return res.status(200).json({
      status: "success",
      message: "OpenRouter API Key updated successfully.",
      data: {
        hasKey: !!admin.openrouter_key,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  changeAdminPassword,
  getOpenRouterKey,
  updateOpenRouterKey,
};
