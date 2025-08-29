# Fynito Admin Portal

A comprehensive superadmin portal for the Fynito app with restaurant management, payment processing, and support system.

## Features

- 🔐 **Secure Authentication** - Superadmin login system
- 📊 **Dashboard** - Analytics and overview
- 🏪 **Restaurant Management** - View all restaurants and orders
- 💰 **Payment System** - Monthly payment calculations and Razorpay integration
- 💬 **Support Chat** - Handle support requests and real-time communication
- 📈 **Reports** - Monthly payment summaries and restaurant performance

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: MySQL with Sequelize ORM
- **Authentication**: JWT
- **Payment**: Razorpay integration
- **Real-time**: Socket.io for chat

### Frontend
- **Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Library**: Custom components with modern design
- **State Management**: React Context + Hooks
- **Styling**: CSS Modules

## Project Structure

```
fynito-admin/
├── src/
│   ├── server/           # Backend server code
│   ├── database/         # Database models and migrations
│   ├── middleware/       # Express middleware
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   └── utils/            # Utility functions
├── frontend/             # React frontend application
├── uploads/              # File uploads
└── dist/                 # Compiled backend code
```

## Prerequisites

- Node.js (v18 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finito-admin
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database setup**
   ```bash
   # Create MySQL database
   mysql -u root -p -e "CREATE DATABASE fynito_admin;"
   
   # Run migrations
   npm run db:migrate
   
   # Seed initial data (optional)
   npm run db:seed
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

## Development

### Backend Development
- Backend runs on `http://localhost:5000`
- Auto-reload with nodemon
- TypeScript compilation

### Frontend Development
- Frontend runs on `http://localhost:3000`
- Vite dev server with HMR
- TypeScript support

### Database
- MySQL connection with Sequelize
- Models for restaurants, orders, payments, support tickets
- Automatic migrations

## API Endpoints

### Authentication
- `POST /api/auth/login` - Superadmin login

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/analytics` - Analytics data

### Restaurants
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/:id/orders` - Get restaurant orders

### Payments
- `GET /api/payments/monthly` - Monthly payment reports
- `POST /api/payments/settle` - Bulk settlement via Razorpay

### Support
- `GET /api/support/tickets` - List support tickets
- `POST /api/support/tickets` - Create support ticket
- `PUT /api/support/tickets/:id` - Update ticket status

## Environment Variables

See `env.example` for all required environment variables.

## Build & Deployment

```bash
# Build for production
npm run build

# Start production server
npm start
```

## Contributing

1. Follow TypeScript best practices
2. Use meaningful commit messages
3. Test your changes thoroughly
4. Follow the existing code structure

## License

MIT License
