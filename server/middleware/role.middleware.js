// Role-Based Access Control (RBAC) Middleware
// Page 6 & Page 14 of specification:
// Roles: ADMIN, CUSTOMER, SUPPORT
// ADMIN -> manage plans, customers, reports
// CUSTOMER -> own profile, usage, invoices, payments
// SUPPORT -> customer support and permitted read operations

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated user.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' is not authorized to access this resource. Required roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};
