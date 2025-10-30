# ApexRebate API Documentation

## 📋 Overview

The ApexRebate API provides RESTful endpoints for managing user accounts, calculating rebates, tracking referrals, and more. All endpoints return JSON responses and follow standard HTTP status codes.

## 🔐 Authentication

Most API endpoints require authentication via NextAuth.js sessions. Include the session cookie in your requests to access protected endpoints.

### Session Check
```http
GET /api/auth/session
```

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "expires": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## 📊 Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

## 🔑 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "referralCode": "REFERRAL123" // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "USER",
      "referralCode": "USER123"
    }
  }
}
```

### Sign In
```http
POST /api/auth/signin
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sign Out
```http
POST /api/auth/signout
```

## 👤 User Management Endpoints

### Get User Profile
```http
GET /api/user/profile
```

**Authentication Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "USER",
    "tradingVolume": 1000000,
    "preferredBroker": "binance",
    "experience": "intermediate",
    "referralCode": "USER123",
    "referredBy": "REFERRER123",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "totalReferrals": 5,
    "totalPayouts": 250.50
  }
}
```

### Update User Profile
```http
PUT /api/user/profile
```

**Authentication Required:** Yes

**Request Body:**
```json
{
  "name": "John Doe Updated",
  "tradingVolume": 1500000,
  "preferredBroker": "bybit",
  "experience": "advanced"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "name": "John Doe Updated",
    "tradingVolume": 1500000,
    "preferredBroker": "bybit",
    "experience": "advanced"
  }
}
```

## 🤝 Referral System Endpoints

### Get User Referrals
```http
GET /api/user/referrals
```

**Authentication Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "referrals": [
      {
        "id": "referral_id",
        "referredUser": {
          "id": "user_id",
          "name": "Jane Doe",
          "email": "jane@example.com"
        },
        "status": "active",
        "rewardAmount": 25.00,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "totalPages": 1
    },
    "stats": {
      "totalReferrals": 5,
      "activeReferrals": 4,
      "totalRewards": 125.00
    }
  }
}
```

### Validate Referral Code
```http
GET /api/referrals/validate?code=REFERRAL123
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "referrer": {
      "name": "John Doe"
    }
  }
}
```

## 💰 Calculator Endpoints

### Calculate Rebate
```http
GET /api/calculator
```

**Query Parameters:**
- `volume` (required): Trading volume in USD
- `broker` (required): Broker name (binance, bybit, okx)
- `tradeType` (required): Trade type (maker, taker)
- `tradesPerMonth` (required): Number of trades per month

**Example:**
```http
GET /api/calculator?volume=1000000&broker=binance&tradeType=taker&tradesPerMonth=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "broker": "binance",
    "volume": 1000000,
    "tradeType": "taker",
    "tradesPerMonth": 20,
    "vipLevel": "VIP1",
    "feeRate": 0.0004,
    "totalFees": 400.00,
    "rebateRate": 0.40,
    "monthlyRebate": 160.00,
    "yearlyRebate": 1920.00,
    "effectiveFeeRate": 0.00024
  }
}
```

### Get Broker Fee Structure
```http
GET /api/calculator/fees/:broker
```

**Response:**
```json
{
  "success": true,
  "data": {
    "broker": "binance",
    "feeStructure": {
      "maker": [
        { "level": "Normal", "minVolume": 0, "fee": 0.0002, "rebate": 0.20 },
        { "level": "VIP1", "minVolume": 50000000, "fee": 0.00015, "rebate": 0.25 }
      ],
      "taker": [
        { "level": "Normal", "minVolume": 0, "fee": 0.0004, "rebate": 0.20 },
        { "level": "VIP1", "minVolume": 50000000, "fee": 0.0003, "rebate": 0.25 }
      ]
    }
  }
}
```

## 🏆 Wall of Fame Endpoints

### Get Wall of Fame
```http
GET /api/wall-of-fame
```

**Query Parameters:**
- `period` (optional): Time period (week, month, year, all)
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "John Doe",
        "totalSaved": 1250.75,
        "totalTrades": 150,
        "preferredBroker": "binance",
        "rank": 1,
        "change": "+2"
      }
    ],
    "stats": {
      "totalUsers": 100,
      "totalSaved": 25000.00,
      "averageSaved": 250.00
    }
  }
}
```

## 💸 Payouts Endpoints

### Get User Payouts
```http
GET /api/user/payouts
```

**Authentication Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `broker` (optional): Filter by broker
- `status` (optional): Filter by status (pending, processed, failed)
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": "payout_id",
        "amount": 50.25,
        "broker": "binance",
        "tradeType": "taker",
        "status": "processed",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "processedAt": "2024-01-02T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    },
    "stats": {
      "totalPayouts": 1250.75,
      "pendingPayouts": 50.25,
      "processedPayouts": 1200.50
    }
  }
}
```

### Export Payouts
```http
GET /api/user/payouts/export
```

**Authentication Required:** Yes

**Query Parameters:** Same as `/api/user/payouts`

**Response:** CSV file download

## 🔔 Notifications Endpoints

### Get User Notifications
```http
GET /api/notifications
```

**Authentication Required:** Yes

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `type` (optional): Filter by type (payout, referral, system)
- `read` (optional): Filter by read status (true, false)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "notification_id",
        "type": "payout",
        "title": "New Payout Received",
        "message": "You've received $25.00 from Binance",
        "read": false,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    },
    "unreadCount": 3
  }
}
```

### Mark Notification as Read
```http
PUT /api/notifications/:id/read
```

**Authentication Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "notification_id",
    "read": true
  }
}
```

### Mark All Notifications as Read
```http
PUT /api/notifications/read-all
```

**Authentication Required:** Yes

**Response:**
```json
{
  "success": true,
  "data": {
    "updatedCount": 5
  }
}
```

## 🛡️ Admin Endpoints

### Get All Users (Admin)
```http
GET /api/admin/users
```

**Authentication Required:** Yes (Admin role)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `role` (optional): Filter by role
- `search` (optional): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "email": "user@example.com",
        "name": "John Doe",
        "role": "USER",
        "tradingVolume": 1000000,
        "totalReferrals": 5,
        "totalPayouts": 250.50,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### Process Payout (Admin)
```http
POST /api/admin/payouts/:id/process
```

**Authentication Required:** Yes (Admin role)

**Request Body:**
```json
{
  "status": "processed",
  "notes": "Processed via bank transfer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "payout_id",
    "status": "processed",
    "processedAt": "2024-01-02T00:00:00.000Z",
    "notes": "Processed via bank transfer"
  }
}
```

### Get System Stats (Admin)
```http
GET /api/admin/stats
```

**Authentication Required:** Yes (Admin role)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "active": 750,
      "newThisMonth": 50
    },
    "payouts": {
      "total": 25000.00,
      "thisMonth": 5000.00,
      "pending": 500.00
    },
    "referrals": {
      "total": 300,
      "thisMonth": 45
    },
    "brokers": {
      "binance": 60,
      "bybit": 25,
      "okx": 15
    }
  }
}
```

## 📊 Analytics Endpoints

### Get User Analytics
```http
GET /api/analytics/user
```

**Authentication Required:** Yes

**Query Parameters:**
- `period` (optional): Time period (week, month, year)

**Response:**
```json
{
  "success": true,
  "data": {
    "payoutsOverTime": [
      { "date": "2024-01-01", "amount": 50.00 },
      { "date": "2024-01-02", "amount": 75.00 }
    ],
    "brokerDistribution": {
      "binance": 60,
      "bybit": 25,
      "okx": 15
    },
    "referralGrowth": [
      { "date": "2024-01-01", "count": 1 },
      { "date": "2024-01-02", "count": 2 }
    ]
  }
}
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | User not authenticated |
| `FORBIDDEN` | User doesn't have permission |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid input data |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

## 🔄 Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints:** 5 requests per minute
- **Calculator endpoints:** 60 requests per minute
- **User endpoints:** 100 requests per minute
- **Admin endpoints:** 200 requests per minute

## 🧪 Testing

### Test Authentication

```bash
# Test session endpoint
curl -X GET http://localhost:3000/api/auth/session \
  -H "Cookie: next-auth.session-token=your-session-token"
```

### Test Calculator

```bash
# Test calculator endpoint
curl -X GET "http://localhost:3000/api/calculator?volume=1000000&broker=binance&tradeType=taker&tradesPerMonth=20"
```

## 📝 SDK Examples

### JavaScript/TypeScript

```typescript
class ApexRebateAPI {
  private baseURL: string;
  private sessionCookie: string;

  constructor(baseURL: string, sessionCookie: string) {
    this.baseURL = baseURL;
    this.sessionCookie = sessionCookie;
  }

  async calculateRebate(params: {
    volume: number;
    broker: string;
    tradeType: string;
    tradesPerMonth: number;
  }) {
    const url = new URL(`${this.baseURL}/calculator`);
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value.toString());
    });

    const response = await fetch(url.toString());
    return response.json();
  }

  async getUserProfile() {
    const response = await fetch(`${this.baseURL}/user/profile`, {
      headers: {
        'Cookie': this.sessionCookie
      }
    });
    return response.json();
  }
}

// Usage
const api = new ApexRebateAPI('http://localhost:3000/api', 'next-auth.session-token=...');
const rebate = await api.calculateRebate({
  volume: 1000000,
  broker: 'binance',
  tradeType: 'taker',
  tradesPerMonth: 20
});
```

### Python

```python
import requests

class ApexRebateAPI:
    def __init__(self, base_url, session_cookie):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.cookies.set('next-auth.session-token', session_cookie)

    def calculate_rebate(self, volume, broker, trade_type, trades_per_month):
        params = {
            'volume': volume,
            'broker': broker,
            'tradeType': trade_type,
            'tradesPerMonth': trades_per_month
        }
        response = self.session.get(f'{self.base_url}/calculator', params=params)
        return response.json()

    def get_user_profile(self):
        response = self.session.get(f'{self.base_url}/user/profile')
        return response.json()

# Usage
api = ApexRebateAPI('http://localhost:3000/api', 'your-session-token')
rebate = api.calculate_rebate(1000000, 'binance', 'taker', 20)
```

## 📞 Support

For API support, please contact:
- **Email:** api-support@apexrebate.com
- **Documentation:** https://docs.apexrebate.com
- **Status Page:** https://status.apexrebate.com

---

*Last updated: January 2024*