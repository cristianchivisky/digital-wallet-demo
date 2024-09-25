# Digital Wallet Demo

This project is a demonstration of a digital wallet application with QR code-based payment functionality. It includes both a backend API built with Node.js and Express, and a frontend mobile app built with React Native and Expo.

## Project Structure

The project consists of two main parts:

1. Backend API
2. Mobile App

### Backend API

The backend is built with Node.js and Express, and uses Redis for data storage. It provides endpoints for:

- User authentication
- Balance verification
- Payment processing
- QR code generation

Key files:
- `app.js`: Main application file
- `Dockerfile`: Docker configuration for the backend
- `docker-compose.yaml`: Docker Compose configuration for the entire project

### Mobile App

The mobile app is built with React Native and Expo. It provides a user interface for:

- User registration and login
- Viewing balance
- Scanning QR codes
- Making payments

## Setup and Installation 

### Prerequisites

- Node.js
- Docker
- Git

1. Open your terminal or command prompt.
2. Clone the repository:
   ```
   git clone https://github.com/cristianchivisky/digital-wallet-demo.git
   ```

### Backend Setup

1. Navigate to the backend directory:
2. Create a `.env` file in the backend directory and add the following line:
   ```
   SECRET_KEY=your_secret_key_here
   ```
3. Build and start the Docker containers:
   ```
   docker compose build
   docker compose up
   ```

This will start the Node.js server and Redis database.

### Mobile App Setup

1. Navigate to the mobile app directory:
2. Install dependencies:
   ```
   npm install
   ```
3. Start the Expo development server:
   ```
   npm run start
   ```

## Usage

1. Launch the mobile app on your device or emulator.
2. Register or log in with your credentials.
3. View your balance on the home screen.
4. To make a payment:
   - Click "Scan QR Code"
   - Scan a valid QR code
   - Confirm the payment on the Payment screen

## API Endpoints

- `POST /register`: Register a new user
- `POST /login`: Authenticate a user and receive a JWT
- `GET /balance`: Get the user's current balance
- `GET /generate-qr`: Generate a QR code for a transaction
- `POST /process-payment`: Process a payment

## Security

- JWT (JSON Web Tokens) are used for authentication.
- Passwords are securely hashed before storage.

## Future Improvements

- Implement real-time balance updates
- Add transaction history feature
- Enhance error handling and user feedback
- Implement unit and integration tests

## Contributing

Contributions are welcome! Here's how you can contribute to this project:

1. Fork the repository
2. Clone your forked repository:
   ```
   git clone https://github.com/cristianchivisky/digital-wallet-demo.git
   ```
3. Create a new branch for your feature:
   ```
   git checkout -b feature/your-feature-name
   ```
4. Make your changes and commit them:
   ```
   git commit -m "Add your commit message here"
   ```
5. Push your changes to your fork:
   ```
   git push origin feature/your-feature-name
   ```
6. Create a Pull Request from your forked repository to the original repository

Please ensure your code adheres to the existing style and that you've tested your changes before submitting a Pull Request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.