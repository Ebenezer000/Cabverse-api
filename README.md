# TDR Cabv API

A Next.js API for managing users, staking, swapping, and transaction tracking with wallet and email authentication.

## Features

- **Dual Authentication**: Users can sign up with wallet address, email, or both
- **Staking System**: Users can stake tokens for specified durations with flexible options
- **Swap Tracking**: Track swap transactions with external service integration
- **Transfer Tracking**: Monitor transfer transactions and external service transactions
- **Transaction Management**: Comprehensive transaction history and status tracking

## Database Schema

### User Model
- Supports wallet-only, email-only, or both authentication methods
- Optional username field
- Tracks authentication type

### Stake Model
- Token staking with configurable duration and APY
- Flexible staking options
- Status tracking (ACTIVE, COMPLETED, CANCELLED, UNSTAKED)

### Transaction Model
- Multiple transaction types (SWAP, TRANSFER, STAKE, UNSTAKE, EXTERNAL_TRANSFER)
- External service integration
- Gas and block information tracking

## API Endpoints

### User Management
- `POST /api/user/signup` - Create new user (wallet/email/both)

### Staking
- `POST /api/stake/create` - Create new stake
- `PUT /api/stake/update` - Update existing stake
- `GET /api/stake/list` - List stakes with pagination

### Transactions
- `POST /api/swap/create` - Create swap transaction
- `POST /api/transfer/create` - Create transfer transaction
- `POST /api/transaction/external` - Record external transaction
- `GET /api/transaction/list` - List transactions with pagination

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
DATABASE_URL="your_postgresql_connection_string"
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

## Authentication

The API does not require authentication. Users are identified by their wallet address or email when creating accounts and transactions.

## Response Format

All API responses follow this format:
```json
{
  "status_code": 200,
  "status": true,
  "message": "Success message",
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 1
  },
  "data": { ... }
}
```

## Error Handling

The API returns appropriate HTTP status codes and error messages for various scenarios:
- 400: Bad Request (missing required fields)
- 401: Unauthorized (invalid authentication)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error

## External Service Integration

The system supports tracking transactions from external services like:
- Uniswap
- 1inch
- Other DEX platforms

External transactions are automatically marked as CONFIRMED status.
