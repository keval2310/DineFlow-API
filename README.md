<div align="center">

# 🍽️ DineFlow POS

### Modern Restaurant Management System

[![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**A comprehensive, modern web interface for restaurant management built with cutting-edge technologies.**

[Features](#-features) • [Demo](#-demo) • [Installation](#-installation) • [Documentation](#-documentation)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture](#-architecture)
- [Role-Based Access](#-role-based-access-control)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Integration](#-api-integration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

**DineFlow POS** is a modern, full-featured restaurant management system frontend that provides an intuitive interface for managing all aspects of restaurant operations. Built with Next.js 16, React 19, and TypeScript, it offers a seamless experience for restaurant staff across different roles.

### Why DineFlow?

✅ **Modern Tech Stack** - Built with the latest versions of Next.js, React, and Tailwind CSS  
✅ **Role-Based Access** - Sophisticated permission system for different staff roles  
✅ **Real-Time Updates** - Live kitchen display system for order tracking  
✅ **Responsive Design** - Works flawlessly on desktop, tablet, and mobile devices  
✅ **Type-Safe** - Full TypeScript implementation for robust code  
✅ **Clean Architecture** - Well-organized service layer and component structure  

---

## 🚀 Features

### Core Functionality

#### 🏠 **Dashboard**
- Role-specific navigation and quick access
- Real-time overview of restaurant operations
- User information and system status
- Beautiful, modern UI with smooth animations

#### 📝 **Order Management**
- Create, view, and manage customer orders
- Order status tracking (Pending, Preparing, Ready, Completed)
- Order item details with pricing
- Integration with table management

#### 👨‍🍳 **Kitchen Display System (KDS)**
- Dedicated interface for kitchen staff (`/kitchen-orders`)
- Real-time order updates
- Visual status indicators (color-coded)
- Order preparation workflow management
- Auto-refresh functionality

#### 🍕 **Menu Management**
- **Categories**: Organize menu items into logical groups
- **Menu Items**: Full CRUD operations for dishes and drinks
- Item details: name, description, price, category
- Image support for menu items

#### 🪑 **Table Management**
- Manage restaurant layout and seating
- Table status tracking (Available, Occupied, Reserved)
- Capacity management
- Table assignment to orders

#### 👥 **User Management**
- User account administration
- Role assignment (Manager, Waiter, Chef, Cashier)
- User authentication and authorization
- Profile management

#### 🏢 **Restaurant Configuration**
- Restaurant details and settings
- Operating hours management
- System preferences

#### 🔐 **Authentication & Security**
- Secure login system
- JWT-based authentication
- Protected routes
- Role-based access control
- Session management

---

## 🛠️ Tech Stack

### Frontend Framework
- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript 5](https://www.typescriptlang.org/)** - Type-safe development

### Styling & UI
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **Custom CSS** - Additional styling for animations and effects
- **Responsive Design** - Mobile-first approach

### HTTP & State Management
- **[Axios](https://axios-http.com/)** - HTTP client for API requests
- **React Context API** - Global state management (Auth, etc.)

### Development Tools
- **ESLint** - Code linting and quality
- **PostCSS** - CSS processing
- **Turbopack** - Fast development builds

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│         Next.js Frontend (App Router)   │
│  ┌────────────┐  ┌──────────────────┐  │
│  │   Pages    │  │   Components     │  │
│  │  (Routes)  │  │  (UI Elements)   │  │
│  └────────────┘  └──────────────────┘  │
│  ┌────────────┐  ┌──────────────────┐  │
│  │  Services  │  │     Context      │  │
│  │ (API Calls)│  │  (State Mgmt)    │  │
│  └────────────┘  └──────────────────┘  │
└─────────────────────────────────────────┘
                    ↕ HTTP (Axios)
┌─────────────────────────────────────────┐
│           Backend REST API              │
│         (Spring Boot / Node.js)         │
└─────────────────────────────────────────┘
                    ↕
┌─────────────────────────────────────────┐
│            Database (MySQL)             │
└─────────────────────────────────────────┘
```

### Key Components

- **Pages (Routes)**: Next.js App Router pages for each feature
- **Components**: Reusable UI components (Layout, Forms, Tables, etc.)
- **Services**: API integration layer with Axios
- **Context**: Global state management (Authentication, User data)
- **Utils**: Helper functions and utilities

---

## 🔐 Role-Based Access Control

DineFlow implements a sophisticated role-based permission system:

| Role | Dashboard Access | Features |
|------|-----------------|----------|
| **👨‍💼 Manager** | Full Access | • Manage Users<br>• Manage Tables<br>• Menu Items<br>• View Orders<br>• Restaurant Settings |
| **🍽️ Waiter** | Limited Access | • Manage Tables<br>• Menu Items<br>• View Orders<br>• Create Orders |
| **👨‍🍳 Chef** | Kitchen Focus | • Kitchen Orders (KDS)<br>• Menu Items<br>• Order Status Updates |
| **💰 Cashier** | Order & Payment | • View Orders<br>• Manage Tables<br>• Process Payments |

### How It Works

1. **Authentication**: Users log in with credentials
2. **Role Assignment**: Each user has a specific role
3. **Route Protection**: `ProtectedRoute` component guards pages
4. **Dynamic Navigation**: Dashboard shows role-appropriate options
5. **API Authorization**: Backend validates permissions for each request

---

## 📦 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **npm** or **yarn** - Package manager
- **Git** - Version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/keval2310/DineFlow-API.git
   cd DineFlow-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure Environment Variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   cp .env.example .env.local
   ```
   
   Update the environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   NEXT_PUBLIC_API_TIMEOUT=10000
   NEXT_PUBLIC_DEBUG=false
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

---

## 📂 Project Structure

```
DineFlow-API/
├── app/                          # Next.js App Router directory
│   ├── components/               # Reusable UI components
│   │   ├── common/              # Common components (Loading, ProtectedRoute)
│   │   └── layout/              # Layout components (Header, DashboardLayout)
│   ├── context/                 # React Context providers
│   │   └── AuthContext.tsx      # Authentication context
│   ├── services/                # API service layer
│   │   ├── authService.ts       # Authentication API calls
│   │   ├── orderService.ts      # Order management API
│   │   ├── menuItemService.ts   # Menu item API
│   │   ├── tableService.ts      # Table management API
│   │   └── userService.ts       # User management API
│   ├── utils/                   # Utility functions
│   │   ├── axios.ts             # Axios configuration
│   │   └── helpers.ts           # Helper functions
│   ├── dashboard/               # Dashboard page
│   ├── kitchen-orders/          # Kitchen display system
│   ├── login/                   # Login page
│   ├── menu-categories/         # Menu category management
│   ├── menu-items/              # Menu item management
│   ├── orders/                  # Order management
│   ├── restaurants/             # Restaurant configuration
│   ├── tables/                  # Table management
│   ├── users/                   # User management
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects)
│   └── globals.css              # Global styles
├── public/                      # Static assets
│   └── screenshots/             # Repository screenshots
├── .env.example                 # Environment variables template
├── .gitignore                   # Git ignore rules
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
├── package.json                 # Dependencies and scripts
└── README.md                    # This file
```

---

## 🔌 API Integration

### Service Layer Architecture

DineFlow uses a clean service layer pattern for API integration:

```typescript
// Example: Order Service
import apiClient from '../utils/axios';

export const orderService = {
  // Get all orders
  getAllOrders: async () => {
    const response = await apiClient.get('/orders');
    return response.data;
  },
  
  // Create new order
  createOrder: async (orderData) => {
    const response = await apiClient.post('/orders', orderData);
    return response.data;
  },
  
  // Update order status
  updateOrderStatus: async (orderId, status) => {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  }
};
```

### API Endpoints Used

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/login` | POST | User authentication |
| `/users` | GET, POST, PUT, DELETE | User management |
| `/restaurants` | GET, POST, PUT | Restaurant configuration |
| `/tables` | GET, POST, PUT, DELETE | Table management |
| `/menu-categories` | GET, POST, PUT, DELETE | Menu categories |
| `/menu-items` | GET, POST, PUT, DELETE | Menu items |
| `/orders` | GET, POST, PUT, DELETE | Order management |
| `/order-items` | GET, POST, PUT, DELETE | Order items |

### Authentication Flow

1. User submits credentials via login form
2. Frontend sends POST request to `/auth/login`
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. Axios interceptor adds token to all subsequent requests
6. Protected routes verify authentication status

---

## 🎨 Design Philosophy

### Modern & Clean
- Gradient backgrounds for visual appeal
- Card-based layouts for content organization
- Consistent spacing and typography
- Smooth animations and transitions

### User-Centric
- Intuitive navigation
- Clear visual hierarchy
- Responsive feedback (loading states, error messages)
- Accessibility considerations

### Performance
- Optimized bundle size
- Lazy loading where appropriate
- Efficient re-renders with React best practices
- Fast page transitions

---

## 🚧 Future Enhancements

- [ ] Real-time notifications using WebSockets
- [ ] Advanced reporting and analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Mobile app (React Native)
- [ ] Inventory management module
- [ ] Customer feedback system
- [ ] Reservation system
- [ ] Payment gateway integration
- [ ] QR code menu for customers

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Commit your changes** (`git commit -m 'Add some AmazingFeature'`)
4. **Push to the branch** (`git push origin feature/AmazingFeature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Maintain consistent code style (use ESLint)
- Write meaningful commit messages
- Update documentation for new features
- Test thoroughly before submitting PR

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Keval**
- GitHub: [@keval2310](https://github.com/keval2310)
- Project Link: [https://github.com/keval2310/DineFlow-API](https://github.com/keval2310/DineFlow-API)

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- React team for the powerful UI library
- Tailwind CSS for the utility-first CSS framework
- All contributors and supporters

---

<div align="center">

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Keval](https://github.com/keval2310)

</div>
