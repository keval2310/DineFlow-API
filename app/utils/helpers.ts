import { UserRole, ROLE_PERMISSIONS } from './constants';

// Get user role from token
export const getUserRole = (): UserRole | null => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return (payload.UserRole || payload.data?.UserRole)?.toLowerCase() || null;
    } catch (error) {
        return null;
    }
};

// Get user data from token
export const getUserData = () => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.UserID ? payload : (payload.data || null);
    } catch (error) {
        return null;
    }
};

// Check if user has specific role
export const hasRole = (allowedRoles: UserRole[]): boolean => {
    const userRole = getUserRole();
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
};

// Check if user has permission
export const hasPermission = (permission: keyof typeof ROLE_PERMISSIONS.manager): boolean => {
    const userRole = getUserRole();
    if (!userRole) return false;

    const permissions = ROLE_PERMISSIONS[userRole];
    return permissions?.[permission] || false;
};

// Format date
export const formatDate = (date: string | Date): string => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

// Format currency
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

// Get status badge class
export const getStatusBadgeClass = (status: string): string => {
    const statusMap: Record<string, string> = {
        pending: 'badge-warning',
        preparing: 'badge-info',
        served: 'badge-success',
        paid: 'badge-secondary',
        free: 'badge-success',
        occupied: 'badge-danger',
    };
    return statusMap[status.toLowerCase()] || 'badge-secondary';
};
