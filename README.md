# EmpathIQ - Emotion-Aware AI Chatbot

EmpathIQ is an intelligent chatbot that understands and responds to users' emotions while providing helpful and accurate information across various topics.

## Features

* Intelligent responses using Google's Gemini AI
* Sentiment analysis for emotional awareness
* Real-time chat interface
* Secure user authentication
* Responsive design

## Tech Stack

* Frontend: React.js
* Backend: Node.js, Express
* Database: MongoDB
* AI: Google Gemini API
* Authentication: JWT

## Setup Instructions

### Prerequisites

* Node.js (v14 or higher)
* MongoDB
* Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/empathiq.git
cd empathiq
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:
   * Copy `.env.example` to `.env` in both frontend and backend directories
   * Fill in the required environment variables

4. Start the development servers:
```bash
# Start backend server
cd backend
npm run dev

# Start frontend server
cd ../frontend
npm start
```

## Environment Variables

### Backend
* `PORT`: Server port (default: 5000)
* `MONGODB_URI`: MongoDB connection string
* `JWT_SECRET`: Secret key for JWT authentication
* `GEMINI_API_KEY`: Google Gemini API key

### Frontend
* `REACT_APP_API_URL`: Backend API URL

## Deployment

1. Make sure to update the `.env` files with production values
2. Build the frontend:
```bash
cd frontend
npm run build
```

3. Deploy to your preferred hosting platform

## Security Notes

* Never commit `.env` files to version control
* Keep API keys and secrets secure
* Use environment variables for sensitive data
* Enable CORS only for trusted domains in production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.