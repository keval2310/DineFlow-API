
// Mock Data matching the user's previous environment (based on screenshots)

// Users
export const MOCK_USERS = [
    { UserID: 3154, UserName: 'admin', UserRole: 'manager', RestaurantID: 1 },
    { UserID: 3178, UserName: '23010101064', UserRole: 'manager', RestaurantID: 1 },
    { UserID: 3179, UserName: '230101011...', UserRole: 'waiter', RestaurantID: 1 },
    { UserID: 3183, UserName: '240101016...', UserRole: 'chef', RestaurantID: 1 },
    // Add a fallback for current login if not one of above
    { UserID: 1, UserName: 'testuser', UserRole: 'manager', RestaurantID: 1 },
];

// Tables
export const MOCK_TABLES = [
    { TableID: 1, TableNumber: 1, TableCapacity: 4, TableStatus: 'occupied', RestaurantID: 1 },
    { TableID: 2, TableNumber: 2, TableCapacity: 4, TableStatus: 'free', RestaurantID: 1 },
    { TableID: 3, TableNumber: 3, TableCapacity: 4, TableStatus: 'free', RestaurantID: 1 },
    { TableID: 95, TableNumber: 888, TableCapacity: 6, TableStatus: 'free', RestaurantID: 1 },
    { TableID: 438, TableNumber: 112, TableCapacity: 2, TableStatus: 'free', RestaurantID: 1 },
    { TableID: 498, TableNumber: 5, TableCapacity: 4, TableStatus: 'free', RestaurantID: 1 },
];

// Menu Categories
export const MOCK_MENU_CATEGORIES = [
    { MenuCategoryID: 1, MenuCategoryName: 'DEMOABC', RestaurantID: 1, MenuCategoryDescription: 'Demo Category' },
    { MenuCategoryID: 2, MenuCategoryName: 'VIDESHI', RestaurantID: 1, MenuCategoryDescription: 'Foreign Food' },
    { MenuCategoryID: 3, MenuCategoryName: 'CHINESE', RestaurantID: 1, MenuCategoryDescription: 'Chinese Cuisine' },
    { MenuCategoryID: 65, MenuCategoryName: 'TEST BY TIRTH', RestaurantID: 1, MenuCategoryDescription: 'Testing' },
    { MenuCategoryID: 300, MenuCategoryName: 'DOSA', RestaurantID: 1, MenuCategoryDescription: 'South Indian' },
];

// Menu Items
export const MOCK_MENU_ITEMS = [
    { MenuItemID: 1, MenuItemName: 'Caesar Salad', MenuItemPrice: 12.99, MenuCategoryID: 1, MenuCategoryName: 'DEMOABC', MenuItemImagePath: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800' },
    { MenuItemID: 2, MenuItemName: 'ROTLI', MenuItemPrice: 1.00, MenuCategoryID: 1, MenuCategoryName: 'DEMOABC', MenuItemImagePath: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800' },
    { MenuItemID: 3, MenuItemName: 'Bread', MenuItemPrice: 4.00, MenuCategoryID: 2, MenuCategoryName: 'VIDESHI', MenuItemImagePath: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?auto=format&fit=crop&w=800' },
    { MenuItemID: 4, MenuItemName: 'Chinese Bhel', MenuItemPrice: 1.00, MenuCategoryID: 3, MenuCategoryName: 'CHINESE', MenuItemImagePath: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=800' },
    { MenuItemID: 71, MenuItemName: 'Momos', MenuItemPrice: 33.00, MenuCategoryID: 65, MenuCategoryName: 'TEST BY TIRTH', MenuItemImagePath: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=800' },
];

// Orders
export const MOCK_ORDERS = [
    { OrderID: 2, TableID: 2, TableNumber: 2, TotalAmount: 0.00, OrderStatus: 'pending', RestaurantID: 1, Created: new Date().toISOString() },
    { OrderID: 6, TableID: 1, TableNumber: 1, TotalAmount: 50.00, OrderStatus: 'preparing', RestaurantID: 1, Created: new Date().toISOString() },
    { OrderID: 7, TableID: 1, TableNumber: 1, TotalAmount: 12.00, OrderStatus: 'served', RestaurantID: 1, Created: new Date().toISOString() },
    { OrderID: 8, TableID: 1, TableNumber: 1, TotalAmount: 2251.00, OrderStatus: 'pending', RestaurantID: 1, Created: new Date().toISOString() },
    { OrderID: 9, TableID: 2, TableNumber: 2, TotalAmount: 15.00, OrderStatus: 'paid', RestaurantID: 1, Created: new Date().toISOString() },
    { OrderID: 10, TableID: 2, TableNumber: 2, TotalAmount: 5.00, OrderStatus: 'served', RestaurantID: 1, Created: new Date().toISOString() },
];

export const MOCK_ORDER_ITEMS = [
    // Order 8 Items (from screenshot)
    { OrderItemID: 101, OrderID: 8, MenuItemID: 1, Quantity: 2, MenuItemPrice: 12.99, SubTotal: 0.00, MenuItemName: 'Caesar Salad' }, // Subtotal 0 per screenshot??
    { OrderItemID: 102, OrderID: 8, MenuItemID: 2, Quantity: 1, MenuItemPrice: 1.00, SubTotal: 0.00, MenuItemName: 'ROTLI' },
    { OrderItemID: 103, OrderID: 8, MenuItemID: 3, Quantity: 1, MenuItemPrice: 4.00, SubTotal: 0.00, MenuItemName: 'Bread' },

    // Other Random Items
    { OrderItemID: 201, OrderID: 6, MenuItemID: 71, Quantity: 1, MenuItemPrice: 33.00, SubTotal: 33.00, MenuItemName: 'Momos' },
    { OrderItemID: 202, OrderID: 6, MenuItemID: 4, Quantity: 2, MenuItemPrice: 1.00, SubTotal: 2.00, MenuItemName: 'Chinese Bhel' },
];

export const getMockData = (url: string) => {
    // Exact matches
    if (url.endsWith('/tables')) return MOCK_TABLES;
    if (url.endsWith('/orders')) return MOCK_ORDERS;
    if (url.endsWith('/menu-items')) return MOCK_MENU_ITEMS;
    if (url.endsWith('/menu-categories')) return MOCK_MENU_CATEGORIES;
    if (url.endsWith('/users')) return MOCK_USERS;

    // Pattern matches
    if (url.includes('/order-items/order/')) {
        const parts = url.split('/');
        const orderId = parseInt(parts[parts.length - 1]);
        if (!isNaN(orderId)) {
            return MOCK_ORDER_ITEMS.filter(item => item.OrderID === orderId) || [];
        }
    }

    if (url.includes('/menu-items/category/')) {
        const parts = url.split('/');
        const catId = parseInt(parts[parts.length - 1]);
        if (!isNaN(catId)) {
            return MOCK_MENU_ITEMS.filter(item => item.MenuCategoryID === catId) || [];
        }
    }

    // Default for orders by table
    if (url.includes('/orders/table/')) {
        return MOCK_ORDERS; // Just return all so the UI finds something
    }

    return [];
};
