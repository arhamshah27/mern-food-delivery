const ROLES = ['customer', 'admin', 'delivery_partner'];
const STAFF_ROLES = ['admin', 'delivery_partner'];

const PERMISSIONS = {
  admin: ['*'],
  delivery_partner: ['delivery:own'],
  customer: [],
  // Legacy role backwards compatibility
  owner: ['*'],
  shop_manager: ['*'],
};

function can(role, permission) {
  const list = PERMISSIONS[role] || [];
  return list.includes('*') || list.includes(permission);
}

function permissionsFor(role) {
  return PERMISSIONS[role] || [];
}

module.exports = {
  ROLES,
  STAFF_ROLES,
  PERMISSIONS,
  can,
  permissionsFor,
};
