# 🦅 RentRoost

**RentRoost** is a modern vacation rental platform that connects travelers with unique homes and experiences. From cozy cottages to urban lofts, find your perfect stay with ease.

## 🚀 Live Demo

**👉 [https://rent-roost.onrender.com](https://rent-roost.onrender.com)**

## ✨ Features

-   **Browse Listings**: Explore a variety of unique properties with detailed descriptions and amenities.
-   **User Accounts**: Sign up and log in securely to manage your bookings.
-   **Booking System**: Check availability and book your stay with real-time validation.
-   **Stripe Payments**: Secure payment integration for seamless transactions.
-   **My Trips**: View and manage your upcoming and past bookings.
-   **Booking Tracking**: Guests can track their bookings using a unique reference code.
-   **Responsive Design**: A beautiful, mobile-friendly interface built with React and Tailwind CSS.

## 🛠️ Tech Stack

-   **Frontend**: React (Vite), TypeScript, Tailwind CSS, Lucide Icons
-   **Backend**: Node.js, Express.js
-   **Database**: MongoDB
-   **Payment**: Stripe API
-   **Deployment**: Render

## 📦 Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone https://github.com/shashankjt/Rent_Roost.git
    cd RentRoost
    ```

2.  **Install Dependencies**
    ```bash
    # Install server dependencies
    cd server
    npm install

    # Install client dependencies
    cd ../client
    npm install
    ```

3.  **Environment Variables**
    Create a `.env` file in the `server` directory:
    ```env
    PORT=5000
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    STRIPE_SECRET_KEY=your_stripe_secret_key
    ```

4.  **Run Locally**
    ```bash
    # Run Server (from /server)
    npm run dev

    # Run Client (from /client)
    npm run dev
    ```

## 📸 Screenshots

*(Add screenshots of your application here)*

---
© 2026 RentRoost. All rights reserved.
