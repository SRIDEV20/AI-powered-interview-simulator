# Authentication Flow

## 🔐 Authentication Strategy: JWT (JSON Web Tokens)

---

## Registration Flow

```
User                    Frontend                Backend                 Database
  |                        |                       |                        |
  |--1. Fill Form--------->|                       |                        |
  |                        |--2. POST /register--->|                        |
  |                        |                       |--3. Check email------->|
  |                        |                       |    exists              |
  |                        |                       |<--4. Email unique------|
  |                        |                       |--5. Hash password----->|
  |                        |                       |    (bcrypt)            |
  |                        |                       |--6. Create user------->|
  |                        |                       |<--7. User created------|
  |                        |<--8. Return user------|                        |
  |<--9. Show success------|                       |                        |
```

### Steps:
1. User fills registration form (email, username, password, full_name)
2. Frontend sends POST request to `/api/auth/register`
3. Backend checks if email already exists
4. Backend hashes password using bcrypt
5. Backend creates user record in database
6. Backend returns user data (without password)
7. Frontend shows success message and redirects to login

---

## Login Flow

```
User                    Frontend                Backend                 Database
  |                        |                       |                        |
  |--1. Enter credentials->|                       |                        |
  |                        |--2. POST /login------>|                        |
  |                        |                       |--3. Find user--------->|
  |                        |                       |    by email            |
  |                        |                       |<--4. User data---------|
  |                        |                       |--5. Verify password--->|
  |                        |                       |    (bcrypt)            |
  |                        |                       |--6. Generate JWT------>|
  |                        |                       |    token               |
  |                        |<--7. Return token-----|                        |
  |                        |    & user data        |                        |
  |<--8. Store token-------|                       |                        |
  |    (localStorage)      |                       |                        |
```

### Steps:
1. User enters email and password
2. Frontend sends POST request to `/api/auth/login`
3. Backend finds user by email
4. Backend verifies password hash matches
5. Backend generates JWT token with user data
6. Backend returns token and user info
7. Frontend stores token in localStorage
8. Frontend redirects to dashboard

---

## Protected Route Access Flow

```
User                    Frontend                Backend                 
  |                        |                       |                        
  |--1. Navigate to------->|                       |                        
  |    protected page      |                       |                        
  |                        |--2. GET /api/xxx----->|                        
  |                        |    Header:            |                        
  |                        |    Authorization:     |                        
  |                        |    Bearer <token>     |                        
  |                        |                       |--3. Verify JWT-------->
  |                        |                       |    signature           
  |                        |                       |--4. Check expiry------>
  |                        |                       |--5. Extract user------->
  |                        |                       |    from token          
  |                        |<--6. Return data------|                        
  |<--7. Display data------|                       |                        
```

### Steps:
1. User navigates to protected page (e.g., dashboard, interviews)
2. Frontend sends request with JWT in Authorization header
3. Backend verifies JWT signature is valid
4. Backend checks token hasn't expired
5. Backend extracts user ID from token
6. Backend returns requested data
7. Frontend displays data to user

---

## JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id_here",
    "email": "user@example.com",
    "exp": 1708347600,
    "iat": 1708261200
  },
  "signature": "encrypted_signature_here"
}
```

### Token Payload Contains:
- `sub` (subject): User ID
- `email`: User email
- `exp` (expiration): Token expiry timestamp (e.g., 24 hours from creation)
- `iat` (issued at): Token creation timestamp

---

## Security Measures

### 1. Password Hashing
- **Library**: bcrypt
- **Rounds**: 12 (good balance of security and performance)
- **Never store plain text passwords**

### 2. JWT Token
- **Secret Key**: Strong, random string stored in environment variables
- **Expiration**: 24 hours (configurable)
- **Algorithm**: HS256

### 3. HTTPS
- All communication over HTTPS in production
- Prevents token interception

### 4. Token Storage (Frontend)
- **Option 1**: localStorage (simple, but vulnerable to XSS)
- **Option 2**: httpOnly cookies (more secure, prevents XSS access)
- **Our choice**: localStorage for simplicity (can upgrade later)

### 5. Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

---

## Logout Flow

```
User                    Frontend                
  |                        |                       
  |--1. Click logout------>|                       
  |                        |--2. Remove token----->
  |                        |    from localStorage  
  |                        |--3. Redirect to------>
  |                        |    login page         
  |<--4. Show login--------|                       
```

### Steps:
1. User clicks logout button
2. Frontend removes JWT token from localStorage
3. Frontend redirects to login page
4. User sees login page

**Note**: With JWT, there's no server-side session to invalidate. Token remains valid until expiration.

---

## Token Refresh (Future Enhancement)

For better security, implement refresh tokens:

- **Access Token**: Short-lived (15 minutes)
- **Refresh Token**: Long-lived (7 days)
- When access token expires, use refresh token to get new access token
- Reduces risk if access token is compromised

---

## Environment Variables (.env file)

```bash
# JWT Settings
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database
DATABASE_URL=postgresql://user:password@localhost/ai_interview_db

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```