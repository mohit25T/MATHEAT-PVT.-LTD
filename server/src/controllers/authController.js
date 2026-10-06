import { User } from '../models/User.js';
import { generateToken } from '../middleware/auth.js';
import { logAudit } from '../middleware/audit.js';
import { ROLES } from '../config/constants.js';

// 1. LOGIN
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Please provide username and password.' });
    }

    const user = await User.findOne({ username });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated. Contact administrator.' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    await logAudit({
      req: { user, ip: req.ip },
      action: 'LOGIN',
      module: 'AUTH',
      recordId: user._id,
      entityType: 'User',
      description: `User ${user.username} logged in successfully.`
    });

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department,
        badgeNumber: user.badgeNumber
      }
    });
  } catch (error) {
    next(error);
  }
};

// 2. GET CURRENT AUTHENTICATED USER
export const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// 3. GET ALL USERS
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

// 4. CREATE NEW USER
export const createUser = async (req, res, next) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      role,
      department,
      phone,
      badgeNumber
    } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, first name and last name are required.'
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username: username.trim() }, { email: email.trim().toLowerCase() }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this username or email already exists.'
      });
    }

    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      role: role || 'FURNACE_OPERATOR',
      department: department || 'Operations',
      phone: phone || '',
      badgeNumber: badgeNumber || `EMP-${Date.now().toString().slice(-4)}`
    });

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: `User ${user.firstName} ${user.lastName} registered successfully`,
      user: userResponse
    });
  } catch (error) {
    next(error);
  }
};

// 5. UPDATE USER
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const body = { ...req.body };

    // If password is being updated, handle via save to trigger hashing
    if (body.password) {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      Object.assign(user, body);
      await user.save();
      const userResponse = user.toObject();
      delete userResponse.password;
      return res.json({ success: true, user: userResponse });
    }

    const updated = await User.findByIdAndUpdate(id, body, { new: true }).select('-password');
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, user: updated });
  } catch (error) {
    next(error);
  }
};

// 6. DELETE USER
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `User ${deleted.username} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

// 7. VERIFY ADMIN / SUPERVISOR PASSWORD FOR OPERATOR OVERRIDE
export const verifyAdminPassword = async (req, res, next) => {
  try {
    const { password, username, stage, batchId, reason } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Admin password is required to authorize modifications.'
      });
    }

    let authorizedAdmin = null;

    // 1. If a specific admin username was provided, check that user first
    if (username && username.trim()) {
      const specificUser = await User.findOne({
        username: username.trim(),
        isActive: true
      });
      if (
        specificUser &&
        (specificUser.role === ROLES.ADMIN ||
          specificUser.role === ROLES.SUPER_ADMIN ||
          specificUser.role === ROLES.PLANT_MANAGER)
      ) {
        const isMatch = await specificUser.matchPassword(password);
        if (isMatch) {
          authorizedAdmin = specificUser;
        }
      }
    }

    // 2. If no specific user matched or only password was given, check all active ADMIN / SUPER_ADMIN / PLANT_MANAGER users
    if (!authorizedAdmin) {
      const adminUsers = await User.find({
        role: { $in: [ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.PLANT_MANAGER] },
        isActive: true
      });

      for (const admin of adminUsers) {
        const isMatch = await admin.matchPassword(password);
        if (isMatch) {
          authorizedAdmin = admin;
          break;
        }
      }
    }

    // 3. Fallback check for default seeded admin credentials ('admin' / 'admin@123')
    if (!authorizedAdmin && password === 'admin@123') {
      authorizedAdmin = {
        _id: 'default-admin-id',
        username: 'admin',
        firstName: 'Admin',
        lastName: 'MATHEAT',
        role: ROLES.ADMIN
      };
    }

    if (!authorizedAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin Password. Modification not authorized. Only authorized Administrators or Plant Supervisors can unlock confirmed stages.'
      });
    }

    // 4. Log audit record for supervisor override traceability
    try {
      await logAudit({
        req: { user: authorizedAdmin, ip: req.ip },
        action: 'SUPERVISOR_STAGE_OVERRIDE',
        module: 'OPERATOR_CONSOLE',
        recordId: batchId || null,
        entityType: 'Batch',
        description: `Supervisor override authorized by ${authorizedAdmin.firstName} ${authorizedAdmin.lastName} (${authorizedAdmin.username}) for stage [${stage || 'PREVIOUS_STAGE'}]. Reason: ${reason || 'Operator stage correction'}`
      });
    } catch (auditErr) {
      console.warn('[AUDIT] Override log notice:', auditErr.message);
    }

    return res.json({
      success: true,
      authorized: true,
      adminName: `${authorizedAdmin.firstName} ${authorizedAdmin.lastName}`,
      adminRole: authorizedAdmin.role,
      username: authorizedAdmin.username,
      stage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
};

// 8. CHANGE PASSWORD (AUTHENTICATED SELF-SERVICE)
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password and confirm password do not match.'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect current password. Please try again.'
      });
    }

    user.password = newPassword;
    await user.save();

    await logAudit({
      req: { user, ip: req.ip },
      action: 'PASSWORD_CHANGED',
      module: 'AUTH',
      recordId: user._id,
      entityType: 'User',
      description: `User ${user.username} (${user.firstName} ${user.lastName}) changed their password successfully.`
    });

    return res.json({
      success: true,
      message: 'Password has been updated successfully.'
    });
  } catch (error) {
    next(error);
  }
};

// 9. ADMIN RESET USER PASSWORD
export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long.'
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    targetUser.password = newPassword;
    await targetUser.save();

    await logAudit({
      req: { user: req.user, ip: req.ip },
      action: 'USER_PASSWORD_RESET',
      module: 'AUTH',
      recordId: targetUser._id,
      entityType: 'User',
      description: `Password for user ${targetUser.username} was reset by ${req.user.firstName} ${req.user.lastName} (${req.user.username}).`
    });

    return res.json({
      success: true,
      message: `Password for ${targetUser.username} has been reset successfully.`
    });
  } catch (error) {
    next(error);
  }
};
