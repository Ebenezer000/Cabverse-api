# TDR Cabv API - Postman Documentation

## Overview
Comprehensive Postman documentation for the TDR Cabv API supporting wallet/email authentication, staking, swapping, and transaction tracking.

## Base URL
```
{{base_url}}/api
```

## Environment Variables
| Variable | Description | Example |
|----------|-------------|---------|
| `base_url` | Base URL for the API | `http://localhost:3000` |
| `user_id` | Current user ID | `user-uuid-here` |
| `user_address` | User wallet address | `0x1234567890abcdef` |
| `user_email` | User email for testing | `user@example.com` |

---

## 1. User Management

### 1.1 User Signup (Wallet)
**POST** `{{base_url}}/api/user/signup`

**Body:**
```json
{
  "address": "0x1234567890abcdef",
  "username": "walletuser",
  "authType": "WALLET"
}
```

**Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("User created successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.be.true;
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data.authType).to.eql('WALLET');
    
    // Store user ID for future requests
    pm.environment.set("user_id", jsonData.data.id);
});
```

### 1.2 User Signup (Email)
**POST** `{{base_url}}/api/user/signup`

**Body:**
```json
{
  "email": "user@example.com",
  "username": "emailuser",
  "authType": "EMAIL"
}
```

### 1.3 User Signup (Both)
**POST** `{{base_url}}/api/user/signup`

**Body:**
```json
{
  "address": "0x1234567890abcdef",
  "email": "user@example.com",
  "username": "bothuser",
  "authType": "BOTH"
}
```


---

## 2. Staking Management

### 2.1 Create Stake
**POST** `{{base_url}}/api/stake/create`

**Body:**
```json
{
  "userId": "{{user_id}}",
  "tokenAddress": "0xA0b86a33E6441b8c4C8C0E4A0eF1B2C3D4E5F6G7",
  "tokenSymbol": "ETH",
  "amount": 100.0,
  "duration": 30,
  "apy": 5.5,
  "isFlexible": false
}
```

**Test Script:**
```javascript
pm.test("Stake created successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.be.true;
    pm.expect(jsonData.data).to.have.property('id');
    pm.expect(jsonData.data.status).to.eql('ACTIVE');
    
    // Store stake ID for future requests
    pm.environment.set("stake_id", jsonData.data.id);
});
```

### 2.2 Create Flexible Stake
**POST** `{{base_url}}/api/stake/create`

**Body:**
```json
{
  "userId": "{{user_id}}",
  "tokenAddress": "0xA0b86a33E6441b8c4C8C0E4A0eF1B2C3D4E5F6G7",
  "tokenSymbol": "USDC",
  "amount": 500.0,
  "duration": 90,
  "apy": 7.2,
  "isFlexible": true,
  "minDuration": 7
}
```

### 2.3 Update Stake
**PUT** `{{base_url}}/api/stake/update`

```
```

**Body:**
```json
{
  "stakeId": "{{stake_id}}",
  "duration": 60,
  "amount": 150.0
}
```

**Test Script:**
```javascript
pm.test("Stake updated successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.be.true;
    pm.expect(jsonData.data.duration).to.eql(60);
    pm.expect(jsonData.data.amount).to.eql(150.0);
});
```

### 2.4 List User Stakes
**GET** `{{base_url}}/api/stake/list?userId={{user_id}}&status=ACTIVE&page=1&limit=10`

```
```

**Test Script:**
```javascript
pm.test("Stakes retrieved successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    pm.expect(jsonData).to.have.property('pagination');
});
```

### 2.5 Cancel Stake
**PUT** `{{base_url}}/api/stake/update`

```
```

**Body:**
```json
{
  "stakeId": "{{stake_id}}",
  "status": "CANCELLED"
}
```

---

## 3. Transaction Management

### 3.1 Create Swap Transaction
**POST** `{{base_url}}/api/swap/create`

```
```

**Body:**
```json
{
  "userId": "{{user_id}}",
  "fromToken": "ETH",
  "toToken": "USDC",
  "fromAmount": 1.0,
  "toAmount": 2500.0,
  "swapRate": 2500.0,
  "externalTxHash": "0xabcdef1234567890",
  "externalService": "Uniswap"
}
```

**Test Script:**
```javascript
pm.test("Swap transaction created", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.be.true;
    pm.expect(jsonData.data.type).to.eql('SWAP');
    pm.expect(jsonData.data.status).to.eql('PENDING');
    
    // Store transaction ID
    pm.environment.set("swap_tx_id", jsonData.data.id);
});
```

### 3.2 Create Transfer Transaction
**POST** `{{base_url}}/api/transfer/create`

```
```

**Body:**
```json
{
  "userId": "{{user_id}}",
  "recipient": "0x9876543210fedcba",
  "amount": 100.0,
  "tokenAddress": "0xA0b86a33E6441b8c4C8C0E4A0eF1B2C3D4E5F6G7",
  "externalTxHash": "0x1234567890abcdef",
  "externalService": "MetaMask"
}
```

### 3.3 Record External Transaction
**POST** `{{base_url}}/api/transaction/external`

```
```

**Body:**
```json
{
  "userId": "{{user_id}}",
  "type": "SWAP",
  "externalTxHash": "0xabcdef1234567890",
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

**Test Script:**
```javascript
pm.test("External transaction recorded", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.be.true;
    pm.expect(jsonData.data.status).to.eql('CONFIRMED');
    pm.expect(jsonData.data.externalTxHash).to.eql('0xabcdef1234567890');
});
```

### 3.4 List User Transactions
**GET** `{{base_url}}/api/transaction/list?userId={{user_id}}&type=SWAP&page=1&limit=10`

```
```

**Test Script:**
```javascript
pm.test("Transactions retrieved successfully", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.be.true;
    pm.expect(jsonData.data).to.be.an('array');
    pm.expect(jsonData).to.have.property('pagination');
});
```

### 3.5 List All Transactions (Admin)
**GET** `{{base_url}}/api/transaction/list?page=1&limit=20&sortBy=createdAt&order=desc`

```
```

---

## 4. Response Format

All endpoints return responses in this format:

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

---

## 5. Error Handling

Common error responses:

**400 Bad Request:**
```json
{
  "status_code": 500,
  "status": false,
  "message": "Missing required fields: userId, tokenAddress",
  "data": null
}
```

**401 Unauthorized:**
```json
{
  "status_code": 500,
  "status": false,
  "message": "User not found",
  "data": null
}
```

**404 Not Found:**
```json
{
  "status_code": 500,
  "status": false,
  "message": "Stake not found",
  "data": null
}
```

**409 Conflict:**
```json
{
  "status_code": 500,
  "status": false,
  "message": "User with this address already exists",
  "data": null
}
```

---

## 6. Testing Scenarios

### 6.1 Complete User Journey
1. **Signup with Wallet** → `POST /api/user/signup`
2. **Create Stake** → `POST /api/stake/create`
3. **Create Swap Transaction** → `POST /api/swap/create`
4. **Record External Transaction** → `POST /api/transaction/external`
5. **List Transactions** → `GET /api/transaction/list`

### 6.2 Staking Testing
1. **Create Multiple Stakes** → Multiple `POST /api/stake/create`
2. **Update Stake Duration** → `PUT /api/stake/update`
3. **Cancel Stake** → `PUT /api/stake/update`
4. **List Active Stakes** → `GET /api/stake/list?status=ACTIVE`

### 6.3 Transaction Testing
1. **Create Swap Transaction** → `POST /api/swap/create`
2. **Create Transfer Transaction** → `POST /api/transfer/create`
3. **Record External Transaction** → `POST /api/transaction/external`
4. **Filter Transactions** → `GET /api/transaction/list?type=SWAP`

---

## 7. Postman Collection Setup

### 7.1 Collection Structure
```
TDR Cabv API
├── User Management
│   ├── Signup (Wallet)
│   ├── Signup (Email)
│   └── Signup (Both)
├── Staking Management
│   ├── Create Stake
│   ├── Create Flexible Stake
│   ├── Update Stake
│   ├── List Stakes
│   └── Cancel Stake
└── Transaction Management
    ├── Create Swap Transaction
    ├── Create Transfer Transaction
    ├── Record External Transaction
    └── List Transactions
```

### 7.2 Environment Setup

**Development:**
```json
{
  "base_url": "http://localhost:3000",
  "user_id": "",
  "user_address": "0x1234567890abcdef",
  "user_email": "testuser@example.com",
  "stake_id": "",
  "swap_tx_id": ""
}
```

**Production:**
```json
{
  "base_url": "https://api.tdrcabv.com",
  "user_id": "",
  "user_address": "",
  "user_email": "",
  "stake_id": "",
  "swap_tx_id": ""
}
```

### 7.3 Test Scripts

**Success Response Test:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has correct structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status_code');
    pm.expect(jsonData).to.have.property('status');
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData).to.have.property('data');
});

pm.test("Response status is true", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.status).to.be.true;
});
```

**Error Response Test:**
```javascript
pm.test("Error response structure", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('status_code');
    pm.expect(jsonData).to.have.property('status');
    pm.expect(jsonData).to.have.property('message');
    pm.expect(jsonData.status).to.be.false;
});
```

---

## 8. Data Models

### 8.1 Authentication Types
- **WALLET** - Wallet address only authentication
- **EMAIL** - Email address only authentication
- **BOTH** - Both wallet address and email authentication

### 8.2 Stake Status
- **ACTIVE** - Currently active stake
- **COMPLETED** - Stake period completed
- **CANCELLED** - Stake cancelled by user
- **UNSTAKED** - Stake has been unstaked

### 8.3 Transaction Types
- **SWAP** - Token swapping transactions
- **TRANSFER** - Direct transfer transactions
- **STAKE** - Staking transactions
- **UNSTAKE** - Unstaking transactions
- **EXTERNAL_TRANSFER** - External service transactions

### 8.4 Transaction Status
- **PENDING** - Transaction pending confirmation
- **CONFIRMED** - Transaction confirmed on blockchain
- **FAILED** - Transaction failed
- **CANCELLED** - Transaction cancelled

---

## 9. Best Practices

### 9.1 Rate Limiting
- GET requests: 100 requests per minute
- POST requests: 50 requests per minute
- PUT requests: 25 requests per minute

### 9.2 Security
1. Use HTTPS in production
2. Implement proper JWT authentication
3. Validate all input data
4. Use environment variables for sensitive data
5. Implement request logging

### 9.3 Performance
1. Use pagination for large datasets
2. Cache frequently accessed data
3. Use transactions for multi-step operations
4. Handle rate limiting with exponential backoff

### 9.4 Testing
1. Test all authentication types (WALLET, EMAIL, BOTH)
2. Test stake creation with different durations and APYs
3. Test transaction creation for all types
4. Test external transaction recording
5. Test pagination and filtering

---

This documentation provides a comprehensive guide for testing and integrating with the TDR Cabv API using Postman. All endpoints are documented with examples and testing scenarios cover the most common use cases for wallet/email authentication, staking, and transaction tracking.