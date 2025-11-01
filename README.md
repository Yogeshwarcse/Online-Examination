# Online-Examination-System

A modern online examination system built with React (frontend) and Node.js/Express (backend), featuring user authentication, exam management, and real-time results.

## 🚀 Features

- **User Authentication**: Secure signup/login with JWT tokens
- **Role-based Access**: Admin and Student roles with different permissions
- **Exam Management**: Create, edit, and manage exams (Admin)
- **Question Management**: Add, update, and delete questions (Admin)
- **Take Exams**: Students can take timed exams
- **Results & Leaderboard**: View results and rankings
- **Waste Classification**: AI-powered waste category classification

## 📁 Project Structure

```
├── frontend/          # React + Vite frontend application
├── backend/           # Node.js + Express backend API
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- React 19
- Vite
- Tailwind CSS
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File uploads)
- Tesseract.js (OCR)

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yogeshwarcse/Online-Examination-System.git
   cd Online-Examination-System
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm start
   ```
   Backend will run on `http://localhost:5000`

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your backend API URL
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

## 🌐 Deployment

### Frontend (Vercel)

The frontend is configured to deploy on Vercel. Make sure to set the environment variable:
- `VITE_API_URL`: Your backend API URL (e.g., `https://your-backend.onrender.com/api`)

### Backend (Render)

The backend is configured to deploy on Render. Set the following environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (Render sets this automatically)
- `NODE_ENV`: Set to `production`

## 📝 Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/online-exam
JWT_SECRET=your-secret-key-here
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 📖 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/me` - Get current user

### Exams
- `GET /api/exams` - Get all exams
- `POST /api/exams` - Create exam (Admin)
- `GET /api/exams/:id` - Get exam by ID
- `PUT /api/exams/:id` - Update exam (Admin)
- `DELETE /api/exams/:id` - Delete exam (Admin)

### Questions
- `GET /api/questions` - Get questions
- `POST /api/questions` - Create question (Admin)
- `PUT /api/questions/:id` - Update question (Admin)
- `DELETE /api/questions/:id` - Delete question (Admin)

### Results
- `GET /api/results` - Get results
- `POST /api/results` - Submit exam result
- `GET /api/results/:id` - Get result by ID

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Yogeshwar CSE**
- GitHub: [@Yogeshwarcse](https://github.com/Yogeshwarcse)

