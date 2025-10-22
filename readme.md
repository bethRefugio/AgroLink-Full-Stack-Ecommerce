# AgroLink - Full Stack MERN Application

A web application built with MongoDB, Express.js, React, and Node.js for agricultural connectivity and management.

## Installation

### Install Dependencies

```bash
cd server
npm install
```

```bash
cd client
npm install
```

## Configuration

### Third-Party Services

- **MongoDB Atlas** - Cloud database
- **Resend.com** - Email verification
- **Cloudinary** - Image uploads
- **Stripe** - Payment processing

### Environment Variables

#### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
FRONTEND_URL=http://localhost:3000

# MongoDB Atlas connection
MONGODB_uri=your_mongodb_connection_string

# Resend API for email
RESEND_API=your_resend_api_key

# JWT Secret Keys
SECRET_KEY_ACCESS_TOKEN=your_access_token_secret
SECRET_KEY_REFRESH_TOKEN=your_refresh_token_secret

# Cloudinary Configuration
CLODINARY_CLOUD_NAME=your_cloud_name
CLODINARY_API_KEY=your_api_key
CLODINARY_API_SECRET_KEY=your_api_secret
```

#### Client Environment Variables

Create a `.env` file in the `client` directory:

```env
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_API_URL=http://localhost:8080
```

**Note:** Update `VITE_API_URL` to match your server URL (default: `http://localhost:8080`)

## Running the Application

### Start the Server

```bash
cd server
npm run dev
```

Server runs on `http://localhost:8080`

### Start the Client

```bash
cd client
npm run dev
```

Client runs on `http://localhost:3000`

## Technologies Used

- **Frontend:** React.js (Vite)
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **Services:** Resend (email), Cloudinary (images), Stripe (payments)

---

**Contact:** bethrefugio16@gmail.com