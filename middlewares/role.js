// export const authorizeRoles = (...roles) => {
//     return (req, res, next) => {
//         if (!roles.includes(req.user.role)) {
//             return res.status(403).json({ message: "Access denied" });
//         }
//         next();
//     };
// };


// middlewares/role.js

const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user?.role; // Assuming user role is added to req.user after authentication
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ message: "Access Denied: Unauthorized Role" });
        }
        next();
    };
};
export { authorizeRoles };

// const authorizeRoles = (...allowedRoles) => {
//     return (req, res, next) => {
//         const user = req.user; // Assume user is attached to the request after authentication
//         if (!user || !allowedRoles.includes(user.role)) {
//             return res.status(403).json({ message: 'Access Denied: Unauthorized Role' });
//         }
//         next();
//     };
// };

// export { authorizeRoles };
