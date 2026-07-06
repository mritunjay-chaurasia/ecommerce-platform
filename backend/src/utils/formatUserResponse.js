const formatUserResponse = (user) => ({
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    gender: user.gender,
    avatar: user.avatar,
    role: user.role,
    authProvider: user.authProvider || 'local',
    isEmailVerified: user.isEmailVerified,
    isPhoneVerified: user.isPhoneVerified,
    isActive: user.isActive,
    accountStatus: user.accountStatus,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
});

module.exports = formatUserResponse;
