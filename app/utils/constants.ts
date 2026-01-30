// User Roles
export const USER_ROLES = {
    MANAGER: 'manager',
    WAITER: 'waiter',
    CHEF: 'chef',
    CASHIER: 'cashier',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    PREPARING: 'preparing',
    SERVED: 'served',
    PAID: 'paid',
} as const;

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];

// Table Status
export const TABLE_STATUS = {
    FREE: 'free',
    OCCUPIED: 'occupied',
} as const;

export type TableStatus = typeof TABLE_STATUS[keyof typeof TABLE_STATUS];

// Status Colors
export const STATUS_COLORS = {
    pending: 'warning',
    preparing: 'info',
    served: 'success',
    paid: 'secondary',
    free: 'success',
    occupied: 'danger',
} as const;

// Role Permissions
export const ROLE_PERMISSIONS = {
    manager: {
        canManageUsers: true,
        canManageRestaurant: true,
        canManageTables: true,
        canManageMenu: true,
        canCreateOrders: true,
        canUpdateOrders: true,
        canDeleteOrders: true,
        canViewOrders: true,
    },
    waiter: {
        canManageUsers: false,
        canManageRestaurant: false,
        canManageTables: false,
        canManageMenu: false,
        canCreateOrders: true,
        canUpdateOrders: false,
        canDeleteOrders: false,
        canViewOrders: true,
    },
    chef: {
        canManageUsers: false,
        canManageRestaurant: false,
        canManageTables: false,
        canManageMenu: false,
        canCreateOrders: false,
        canUpdateOrders: true,
        canDeleteOrders: false,
        canViewOrders: true,
    },
    cashier: {
        canManageUsers: false,
        canManageRestaurant: false,
        canManageTables: false,
        canManageMenu: false,
        canCreateOrders: false,
        canUpdateOrders: true,
        canDeleteOrders: false,
        canViewOrders: true,
    },
} as const;

// Navigation Items by Role
export const NAVIGATION_ITEMS = {
    manager: [
        { name: 'Restaurants', path: '/restaurants', icon: '🏢' },
        { name: 'Users', path: '/users', icon: '👥' },
        { name: 'Tables', path: '/tables', icon: '🪑' },
        { name: 'Menu Categories', path: '/menu-categories', icon: '📋' },
        { name: 'Menu Items', path: '/menu-items', icon: '🍕' },
        { name: 'Orders', path: '/orders', icon: '📝' },
        { name: 'Order Items', path: '/order-items', icon: '🛒' },
        { name: 'Kitchen Orders', path: '/kitchen-orders', icon: '👨‍🍳' },
    ],
    waiter: [
        { name: 'Tables', path: '/tables', icon: '🪑' },
        { name: 'Menu Items', path: '/menu-items', icon: '🍕' },
        { name: 'Orders', path: '/orders', icon: '📝' },
        { name: 'Order Items', path: '/order-items', icon: '🛒' },
    ],
    chef: [
        { name: 'Kitchen Orders', path: '/kitchen-orders', icon: '👨‍🍳' },
        { name: 'Orders', path: '/orders', icon: '📝' },
    ],
    cashier: [
        { name: 'Tables', path: '/tables', icon: '🪑' },
        { name: 'Orders', path: '/orders', icon: '📝' },
    ],
} as const;
