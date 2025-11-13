/**
 * Role-Based Access Control (RBAC) Utility Functions
 * 
 * Roles:
 * - Owner: Full access to all settings and features
 * - Admin: Company-level management, most settings
 * - Manager: Operational settings, limited settings access
 * - User/Driver: No settings access
 */

export const ROLES = {
  OWNER: 'Owner',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  USER: 'User',
  DRIVER: 'Driver',
};

/**
 * Check if user has access to Settings page
 * Only Owner and Admin can access Settings
 */
export const canAccessSettings = (userRole) => {
  if (!userRole) return false;
  // Normalize role: trim whitespace and handle case variations
  const role = String(userRole).trim();
  const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
  
  // Explicitly check for Owner or Admin only
  return normalizedRole === ROLES.OWNER || normalizedRole === ROLES.ADMIN;
};

/**
 * Check if user is Owner
 */
export const isOwner = (userRole) => {
  if (!userRole) return false;
  return userRole.trim() === ROLES.OWNER;
};

/**
 * Check if user is Admin or Owner
 */
export const isAdminOrOwner = (userRole) => {
  if (!userRole) return false;
  const role = userRole.trim();
  return role === ROLES.OWNER || role === ROLES.ADMIN;
};

/**
 * Check if user is Manager, Admin, or Owner
 */
export const isManagerOrAbove = (userRole) => {
  if (!userRole) return false;
  const role = userRole.trim();
  return role === ROLES.OWNER || role === ROLES.ADMIN || role === ROLES.MANAGER;
};

/**
 * Get role display name
 */
export const getRoleDisplayName = (userRole) => {
  if (!userRole) return 'User';
  const role = userRole.trim();
  switch (role) {
    case ROLES.OWNER:
      return 'Owner';
    case ROLES.ADMIN:
      return 'Administrator';
    case ROLES.MANAGER:
      return 'Manager';
    case ROLES.USER:
    case ROLES.DRIVER:
      return 'User';
    default:
      return role;
  }
};

/**
 * Check if user can access a specific settings section
 * @param {string} userRole - User's role
 * @param {string} section - Section name (e.g., 'company', 'users', 'vehicles', 'preferences')
 */
export const canAccessSection = (userRole, section) => {
  if (!userRole) return false;
  const role = userRole.trim();

  // Owner has access to everything
  if (role === ROLES.OWNER) return true;

  // Section-specific permissions
  switch (section) {
    case 'company':
    case 'users':
    case 'billing':
      // Only Owner and Admin can access company management
      return role === ROLES.ADMIN;
    
    case 'vehicles':
    case 'fleet':
      // Owner, Admin, and Manager can access fleet management
      return role === ROLES.ADMIN || role === ROLES.MANAGER;
    
    case 'preferences':
    case 'notifications':
      // All roles can access personal preferences
      return true;
    
    case 'account':
      // All roles can access their own account
      return true;
    
    default:
      // Default: only Owner and Admin
      return role === ROLES.ADMIN;
  }
};

