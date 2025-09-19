# TDR Cabv API Documentation

This document outlines all the API endpoints available in the TDR Cabv platform for wallet/email authentication, staking, swapping, and transaction tracking.

## Base URL
All endpoints are prefixed with `/api`

## Authentication
The API does not require authentication. Users are identified by their wallet address or email when creating accounts and transactions.

## User Management

### User Signup
- **POST** `/api/user/signup`
- **Body:**
  ```json
  {
    "address": "0x...", // Optional for wallet auth
    "email": "user@example.com", // Optional for email auth
    "username": "username", // Optional
    "authType": "WALLET" // WALLET, EMAIL, or BOTH
  }
  ```
- **Response:**
  ```json
  {
    "status_code": 200,
    "status": true,
    "message": "User created successfully",
    "data": {
      "id": "user-uuid",
      "address": "0x...",
      "email": "user@example.com",
      "username": "username",
      "authType": "WALLET",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```


## Staking Management

### Create Stake
- **POST** `/api/stake/create`
- **Body:**
  ```json
  {
    "userId": "user-uuid",
    "tokenAddress": "0x...",
    "tokenSymbol": "ETH",
    "amount": 100.0,
    "duration": 30, // in days
    "apy": 5.5, // Annual percentage yield
    "isFlexible": false, // Optional
    "minDuration": 7 // Optional, for flexible stakes
  }
  ```
- **Response:**
  ```json
  {
    "status_code": 200,
    "status": true,
    "message": "Stake created successfully",
    "data": {
      "id": "stake-uuid",
      "userId": "user-uuid",
      "tokenAddress": "0x...",
      "tokenSymbol": "ETH",
      "amount": 100.0,
      "duration": 30,
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-01-31T00:00:00Z",
      "apy": 5.5,
      "status": "ACTIVE",
      "isFlexible": false,
      "minDuration": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

### Update Stake
- **PUT** `/api/stake/update`
- **Body:**
  ```json
  {
    "stakeId": "stake-uuid",
    "duration": 60, // Optional - will recalculate endTime
    "amount": 150.0, // Optional
    "status": "ACTIVE" // Optional: ACTIVE, COMPLETED, CANCELLED, UNSTAKED
  }
  ```
- **Response:**
  ```json
  {
    "status_code": 200,
    "status": true,
    "message": "Stake updated successfully",
    "data": {
      "id": "stake-uuid",
      "userId": "user-uuid",
      "tokenAddress": "0x...",
      "tokenSymbol": "ETH",
      "amount": 150.0,
      "duration": 60,
      "startTime": "2024-01-01T00:00:00Z",
      "endTime": "2024-03-01T00:00:00Z",
      "apy": 5.5,
      "status": "ACTIVE",
      "isFlexible": false,
      "minDuration": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

### List Stakes
- **GET** `/api/stake/list`
- **Query Parameters:**
  - `userId` - Filter by user ID
  - `status` - Filter by status (ACTIVE, COMPLETED, CANCELLED, UNSTAKED)
  - `page`, `limit`, `sortBy`, `order` - Pagination parameters
- **Example:**
  ```
  GET /api/stake/list?userId=user-uuid&status=ACTIVE&page=1&limit=10
  ```
- **Response:**
  ```json
  {
    "status_code": 200,
    "status": true,
    "message": "Stakes retrieved successfully",
    "pagination": {
      "totalItems": 25,
      "totalPages": 3,
      "currentPage": 1
    },
    "data": [
      {
        "id": "stake-uuid",
        "userId": "user-uuid",
        "tokenAddress": "0x...",
        "tokenSymbol": "ETH",
        "amount": 100.0,
        "duration": 30,
        "startTime": "2024-01-01T00:00:00Z",
        "endTime": "2024-01-31T00:00:00Z",
        "apy": 5.5,
        "status": "ACTIVE",
        "isFlexible": false,
        "minDuration": null,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

## Transaction Management

### Create Swap Transaction
- **POST** `/api/swap/create`
- **Body:**
  ```json
  {
    "userId": "user-uuid",
    "fromToken": "ETH",
    "toToken": "USDC",
    "fromAmount": 1.0,
    "toAmount": 2500.0,
    "swapRate": 2500.0,
    "externalTxHash": "0x...", // Optional
    "externalService": "Uniswap" // Optional
  }
  ```
- **Response:**
  ```json
  {
    "status_code": 200,
    "status": true,
    "message": "Swap transaction created successfully",
    "data": {
      "id": "transaction-uuid",
      "userId": "user-uuid",
      "type": "SWAP",
      "status": "PENDING",
      "fromToken": "ETH",
      "toToken": "USDC",
      "fromAmount": 1.0,
      "toAmount": 2500.0,
      "swapRate": 2500.0,
      "externalTxHash": "0x...",
      "externalService": "Uniswap",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

### Create Transfer Transaction
- **POST** `/api/transfer/create`
- **Body:**
  ```json
  {
    "userId": "user-uuid",
    "recipient": "0x...",
    "amount": 100.0,
    "tokenAddress": "0x...",
    "externalTxHash": "0x...", // Optional
    "externalService": "MetaMask" // Optional
  }
  ```
- **Response:**
  ```json
  {
    "status_code": 200,
    "status": true,
    "message": "Transfer transaction created successfully",
    "data": {
      "id": "transaction-uuid",
      "userId": "user-uuid",
      "type": "TRANSFER",
      "status": "PENDING",
      "recipient": "0x...",
      "amount": 100.0,
      "tokenAddress": "0x...",
      "externalTxHash": "0x...",
      "externalService": "MetaMask",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

### Record External Transaction
- **POST** `/api/transaction/external`
- **Body:**
  ```json
  {
    "userId": "user-uuid",
    "type": "SWAP",
    "externalTxHash": "0x...",
    "externalService": "Uniswap",
    "fromToken": "ETH",
    "toToken": "USDC",
    "fromAmount": 1.0,
    "toAmount": 2500.0,
    "gasUsed": 150000,
    "gasPrice": 20.0,
    "blockNumber": 12345678
  }
  ```
- **Response:**
  ```json
  {
    "status_code": 200,
    "status": true,
    "message": "External transaction recorded successfully",
    "data": {
      "id": "transaction-uuid",
      "userId": "user-uuid",
      "type": "SWAP",
      "status": "CONFIRMED",
      "fromToken": "ETH",
      "toToken": "USDC",
      "fromAmount": 1.0,
      "toAmount": 2500.0,
      "externalTxHash": "0x...",
      "externalService": "Uniswap",
      "gasUsed": 150000,
      "gasPrice": 20.0,
      "blockNumber": 12345678,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  }
  ```

### List Transactions
- **GET** `/api/transaction/list`
- **Query Parameters:**
  - `userId` - Filter by user ID
  - `type` - Filter by transaction type (SWAP, TRANSFER, STAKE, UNSTAKE, EXTERNAL_TRANSFER)
  - `status` - Filter by status (PENDING, CONFIRMED, FAILED, CANCELLED)
  - `externalService` - Filter by external service
  - `page`, `limit`, `sortBy`, `order` - Pagination parameters
- **Example:**
  ```
  GET /api/transaction/list?userId=user-uuid&type=SWAP&status=CONFIRMED&page=1&limit=10
  ```
- **Response:**
  ```json
  {
    "status_code": 200,
    "status": true,
    "message": "Transactions retrieved successfully",
    "pagination": {
      "totalItems": 50,
      "totalPages": 5,
      "currentPage": 1
    },
    "data": [
      {
        "id": "transaction-uuid",
        "userId": "user-uuid",
        "type": "SWAP",
        "status": "CONFIRMED",
        "fromToken": "ETH",
        "toToken": "USDC",
        "fromAmount": 1.0,
        "toAmount": 2500.0,
        "swapRate": 2500.0,
        "externalTxHash": "0x...",
        "externalService": "Uniswap",
        "gasUsed": 150000,
        "gasPrice": 20.0,
        "blockNumber": 12345678,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
      }
    ]
  }
  ```

## Response Format

All endpoints return responses in the following format:

```json
{
  "status_code": 200,
  "status": true,
  "message": "Success message",
  "data": {
    // Response data
  },
  "pagination": {
    "totalItems": 100,
    "totalPages": 10,
    "currentPage": 1
  }
}
```

## Error Handling

Errors are returned in the following format:

```json
{
  "status_code": 500,
  "status": false,
  "message": "Error message",
  "data": null
}
```

## Authentication Types

The platform supports the following authentication types:
- **WALLET** - Wallet address only
- **EMAIL** - Email address only
- **BOTH** - Both wallet address and email

## Stake Status

Stakes can have the following statuses:
- **ACTIVE** - Currently active stake
- **COMPLETED** - Stake period completed
- **CANCELLED** - Stake cancelled by user
- **UNSTAKED** - Stake has been unstaked

## Transaction Types

The platform supports the following transaction types:
- **SWAP** - Token swapping transactions
- **TRANSFER** - Direct transfer transactions
- **STAKE** - Staking transactions
- **UNSTAKE** - Unstaking transactions
- **EXTERNAL_TRANSFER** - External service transactions

## Transaction Status

Transactions can have the following statuses:
- **PENDING** - Transaction pending confirmation
- **CONFIRMED** - Transaction confirmed on blockchain
- **FAILED** - Transaction failed
- **CANCELLED** - Transaction cancelled

## External Services

The platform supports tracking transactions from external services:
- **Uniswap** - DEX platform
- **1inch** - DEX aggregator
- **MetaMask** - Wallet service
- **Other DEX platforms** - Custom service names