# DineFlow API Frontend

A modern, comprehensive web interface for the DineFlow Restaurant Management System. This project serves as the frontend client, built with Next.js and Tailwind CSS, to interact with the DineFlow backend API.

## 🚀 Features

DineFlow provides a robust suite of tools for restaurant management:

- **Dashboard**: Real-time overview of restaurant performance and stats.
- **Order Management**: Streamlined processing of customer orders.
- **Kitchen Display System (KDS)**: Dedicated interface for kitchen staff to view and manage incoming orders (`/kitchen-orders`).
- **Menu Management**:
  - **Categories**: Organize menu items into categories.
  - **Menu Items**: Create, edit, and manage individual dishes and drinks.
- **Table Management**: Manage restaurant layout and table availability.
- **User Management**: Administer user accounts, roles, and permissions.
- **Restaurant Management**: Configure restaurant details and settings.
- **Authentication**: Secure login and role-based access control.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Language**: TypeScript

## 📦 Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/DineFlow-API.git
   cd DineFlow-API
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env.local` file in the root directory and add necessary environment variables (e.g., API base URL).
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
DineFlow-API/
├── app/                  # Application source code (App Router)
│   ├── dashboard/        # Dashboard view
│   ├── kitchen-orders/   # Kitchen display views
│   ├── login/            # Authentication views
│   ├── menu-categories/  # Menu category management
│   ├── menu-items/       # Menu item management
│   ├── orders/           # Order management
│   ├── restaurants/      # Restaurant configuration
│   ├── tables/           # Table management
│   ├── users/            # User account management
│   ├── services/         # API service calls
│   └── context/          # React Context (Auth, etc.)
├── components/           # Reusable UI components
├── public/               # Static assets
└── ...config files       # Next.js, Tailwind, ESLint configs
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📝 License

This project is licensed under the MIT License.
