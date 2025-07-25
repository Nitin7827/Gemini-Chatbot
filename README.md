# Gemini Chat - AI Assistant

A ChatGPT-like application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) and powered by Google's Gemini AI API.

## Features

- 🤖 **AI-Powered Conversations**: Chat with Google's Gemini AI
- 💬 **Real-time Messaging**: Stream responses for better UX
- 🔐 **User Authentication**: Secure login/register system
- 💾 **Chat History**: Save and manage your conversations
- 📱 **Responsive Design**: Works on desktop and mobile
- 🎨 **Modern UI**: Beautiful interface with Tailwind CSS
- 📝 **Markdown Support**: Rich text formatting in responses
- 🔒 **JWT Authentication**: Secure token-based auth
- 🚀 **Public Demo**: Try without signing up

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Generative AI** - Gemini API integration

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Markdown** - Markdown rendering
- **Lucide React** - Icons

## Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Google Gemini API Key** (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gemini-chat-app
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the `server` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/gemini-chat
   GEMINI_API_KEY=your_gemini_api_key_here
   JWT_SECRET=your_jwt_secret_here
   NODE_ENV=development
   ```

   **Important**: Replace `your_gemini_api_key_here` with your actual Gemini API key and `your_jwt_secret_here` with a secure random string.

4. **Database Setup**

   Make sure MongoDB is running. If using MongoDB Atlas, update the `MONGODB_URI` in your `.env` file.

## Running the Application

### Development Mode

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm start
   ```

3. **Or run both simultaneously** (from root directory)
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Production Mode

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server**
   ```bash
   cd server
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Chat
- `GET /api/chat` - Get all chats for user
- `GET /api/chat/:chatId` - Get specific chat
- `POST /api/chat` - Create new chat
- `POST /api/chat/:chatId/messages` - Send message to chat
- `POST /api/chat/:chatId/stream` - Stream message response
- `PUT /api/chat/:chatId/title` - Update chat title
- `DELETE /api/chat/:chatId` - Delete chat
- `POST /api/chat/public/chat` - Public chat (no auth required)

## Project Structure

```
gemini-chat-app/
├── server/                 # Backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── services/          # Business logic
│   └── index.js           # Server entry point
├── client/                # Frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API services
│   │   └── App.js         # Main app component
│   └── public/            # Static files
└── README.md
```

## Usage

1. **Public Demo**: Visit `/public` to try the app without signing up
2. **Register/Login**: Create an account or sign in to save conversations
3. **Start Chatting**: Type messages and get AI responses
4. **Manage Chats**: View, edit, and delete your conversations
5. **Update Profile**: Customize your username and avatar

## Features in Detail

### AI Integration
- Uses Google's Gemini Pro model
- Supports streaming responses
- Maintains conversation context
- Auto-generates chat titles

### User Experience
- Real-time typing indicators
- Smooth animations
- Responsive design
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

### Security
- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions:

1. Check the console for error messages
2. Verify your environment variables are set correctly
3. Ensure MongoDB is running
4. Confirm your Gemini API key is valid

## Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for the AI capabilities
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework #   G e m i n i - C h a t b o t  
 #   G e m i n i - C h a t b o t  
 