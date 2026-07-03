# 🔍 FindItCampus — Lost & Found Portal

A **production-ready**, full-stack Lost and Found web application for college campuses. Built with React, Node.js, Express, MongoDB, and JWT authentication.

---

## 📁 Project Structure

```
lost-found-portal/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary + Multer setup
│   ├── controllers/
│   │   ├── authController.js  # Register, login, profile
│   │   ├── itemController.js  # CRUD for lost/found items
│   │   ├── adminController.js # Admin stats, user/item management
│   │   └── messageController.js # Internal messaging
│   ├── middleware/
│   │   ├── auth.js            # JWT protect + role authorize
│   │   └── errorHandler.js    # Global error handler
│   ├── models/
│   │   ├── User.js            # User schema (bcrypt password)
│   │   ├── Item.js            # Item schema (lost/found)
│   │   └── Message.js         # Internal message schema
│   ├── routes/
│   │   ├── auth.js            # /api/auth/*
│   │   ├── items.js           # /api/items/*
│   │   ├── admin.js           # /api/admin/* (admin only)
│   │   └── messages.js        # /api/messages/*
│   ├── uploads/               # Local image fallback (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── server.js              # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.js          # Responsive navbar + dark mode
    │   │   │   ├── ProtectedRoute.js  # Auth guard + admin guard
    │   │   │   ├── SearchBar.js       # Reusable search input
    │   │   │   ├── Pagination.js      # Smart page navigator
    │   │   │   ├── LoadingSpinner.js  # Loading state
    │   │   │   └── EmptyState.js      # Empty state UI
    │   │   └── items/
    │   │       ├── ItemCard.js        # Item grid card
    │   │       └── ItemForm.js        # Post/edit form with image preview
    │   ├── context/
    │   │   ├── AuthContext.js         # Auth state (login/logout/register)
    │   │   └── ThemeContext.js        # Dark/light mode
    │   ├── pages/
    │   │   ├── HomePage.js            # Hero + recent items + features
    │   │   ├── LoginPage.js           # Sign in form
    │   │   ├── RegisterPage.js        # Registration + password strength
    │   │   ├── ItemsPage.js           # Browse all with filters
    │   │   ├── ItemDetailPage.js      # Full item view + messaging
    │   │   ├── SearchPage.js          # Full-text search results
    │   │   ├── DashboardPage.js       # User's items + stats
    │   │   ├── PostItemPage.js        # Report lost/found
    │   │   ├── EditItemPage.js        # Edit existing item
    │   │   ├── MessagesPage.js        # Inbox + sent messages
    │   │   ├── ProfilePage.js         # Profile + password change
    │   │   └── AdminPage.js           # Admin dashboard
    │   ├── services/
    │   │   └── api.js                 # Axios API layer
    │   ├── App.js                     # Routes + providers
    │   └── index.css                  # Tailwind + design tokens
    ├── tailwind.config.js
    ├── postcss.config.js
    └── package.json
```

---

## ⚡ Quick Start (Local Development)

### Prerequisites
- Node.js v18+ and npm v9+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- Git

---

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd lost-found-portal
```

---

### 2. Set up the Backend

```bash
cd backend
npm install
```

Copy and fill in environment variables:

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/lost_found_portal
JWT_SECRET=choose_a_long_random_secret_string_here
JWT_EXPIRE=7d

# Cloudinary (optional — skip for local file storage)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CLIENT_URL=http://localhost:3000
```

Start the backend server:

```bash
npm run dev     # development (nodemon auto-restart)
# or
npm start       # production
```

Backend runs at: **http://localhost:5000**  
Health check: **http://localhost:5000/api/health**

---

### 3. Set up the Frontend

Open a new terminal:

```bash
cd frontend
npm install
```

Copy env file (optional — the `proxy` in `package.json` handles dev API):

```bash
cp .env.example .env
```

Start the React development server:

```bash
npm start
```

Frontend runs at: **http://localhost:3000**

---

### 4. Create an Admin User

After registering normally through the UI, open MongoDB Compass or shell and update your user:

```js
// MongoDB Shell
use lost_found_portal
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

Now log out and log back in — you'll see the Admin panel in the navbar.

---

## 🔌 API Endpoints Reference

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/register` | Public | Register new user |
| POST | `/login` | Public | Login, returns JWT |
| GET | `/me` | 🔒 | Get current user |
| PUT | `/profile` | 🔒 | Update name/phone |
| PUT | `/change-password` | 🔒 | Change password |

### Items — `/api/items`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | Public | List all items (filter, paginate) |
| GET | `/search?q=` | Public | Full-text search |
| GET | `/my-items` | 🔒 | Current user's items |
| GET | `/:id` | Public | Single item detail |
| POST | `/` | 🔒 | Create item (multipart/form-data) |
| PUT | `/:id` | 🔒 | Update item |
| DELETE | `/:id` | 🔒 | Delete item |
| PUT | `/:id/resolve` | 🔒 Owner | Toggle resolved status |
| POST | `/:id/report` | 🔒 | Report item |

### Messages — `/api/messages`
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | 🔒 | Get inbox + sent |
| POST | `/` | 🔒 | Send message about item |
| GET | `/unread-count` | 🔒 | Badge count |

### Admin — `/api/admin` (admin role required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stats` | Dashboard stats + recent activity |
| GET | `/users` | All users (search) |
| PUT | `/users/:id/toggle` | Activate/deactivate user |
| GET | `/items` | All items (filter reported) |
| PUT | `/items/:id/visibility` | Show/hide item |
| DELETE | `/items/:id` | Permanently delete item |

---

## ☁️ Image Uploads

**With Cloudinary (recommended for production):**
1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to `.env`

**Without Cloudinary (local fallback):**
- Images are saved to `backend/uploads/`
- Served at `/uploads/<filename>`
- Works out of the box — no config needed

---

## 🚀 Deployment

### Option A: Render.com (Free Tier — Easiest)

**Deploy Backend:**
1. Push your code to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your repository, select the `backend/` directory
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables in the Render dashboard
7. Use a **MongoDB Atlas** URI for `MONGODB_URI`

**Deploy Frontend:**
1. New → Static Site on Render
2. Connect repository, select `frontend/` directory
3. Build command: `npm install && npm run build`
4. Publish directory: `build`
5. Add env variable: `REACT_APP_API_URL=https://your-backend.onrender.com/api`

---

### Option B: Railway.app

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy backend
cd backend
railway login
railway init
railway up

# Set environment variables via Railway dashboard
```

---

### Option C: VPS (DigitalOcean / AWS EC2)

```bash
# On your server
sudo apt update && sudo apt install -y nodejs npm nginx

# Clone repo
git clone <your-repo>

# Backend with PM2
cd backend
npm install
npm install -g pm2
pm2 start server.js --name lost-found-api
pm2 save && pm2 startup

# Frontend build
cd ../frontend
npm install
npm run build
# Serve build/ folder via Nginx
```

**Sample Nginx config (`/etc/nginx/sites-available/lostandfound`):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # React frontend
    location / {
        root /path/to/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploaded files
    location /uploads {
        proxy_pass http://localhost:5000;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/lostandfound /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Add SSL with Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

### Option D: Docker (Full Stack)

Create `docker-compose.yml` at the root:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: lost_found_portal

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongodb:27017/lost_found_portal
      JWT_SECRET: your_secret_here
      NODE_ENV: production
    depends_on:
      - mongodb
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api
    depends_on:
      - backend

volumes:
  mongo_data:
```

Add `Dockerfile` in `backend/`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Add `Dockerfile` in `frontend/`:
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

Run everything:
```bash
docker-compose up --build
```

---

## 🛠️ Environment Variables Cheatsheet

### Backend `.env`
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No (default 5000) | Server port |
| `NODE_ENV` | Yes | `development` or `production` |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Long random string (32+ chars) |
| `JWT_EXPIRE` | No (default 7d) | Token expiry e.g. `7d`, `30d` |
| `CLOUDINARY_CLOUD_NAME` | No | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | No | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | No | Cloudinary API secret |
| `CLIENT_URL` | Yes | Frontend URL for CORS |

### Frontend `.env`
| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_API_URL` | Production only | Backend API base URL |

---

## 🎨 Features Summary

| Feature | Status |
|---------|--------|
| User registration & login | ✅ |
| JWT authentication | ✅ |
| Password hashing (bcrypt, 12 rounds) | ✅ |
| Post lost items with image | ✅ |
| Post found items with image | ✅ |
| Image preview before upload | ✅ |
| Cloudinary + local storage fallback | ✅ |
| Browse & filter items | ✅ |
| Full-text search | ✅ |
| Item detail page | ✅ |
| Internal messaging | ✅ |
| Contact info reveal | ✅ |
| Dashboard — manage own items | ✅ |
| Mark item as resolved | ✅ |
| Edit & delete items | ✅ |
| Admin panel — stats overview | ✅ |
| Admin — manage users | ✅ |
| Admin — hide/delete posts | ✅ |
| Report inappropriate posts | ✅ |
| Dark mode | ✅ |
| Pagination | ✅ |
| Protected routes | ✅ |
| Responsive mobile design | ✅ |
| Toast notifications | ✅ |

---

## 🔒 Security Features

- Passwords hashed with **bcrypt** (12 salt rounds)
- **JWT tokens** with configurable expiry
- Password never returned in API responses (`select: false`)
- Input validation with **express-validator**
- File type & size validation on upload
- Role-based access control (`user` / `admin`)
- CORS restricted to `CLIENT_URL`
- Global error handler — no stack traces in production
- Inactive users cannot log in

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS v3 |
| State | React Context API |
| HTTP Client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Auth | JWT, bcryptjs |
| File Upload | Multer + Cloudinary |
| Notifications | react-hot-toast |
| Date Formatting | date-fns |

----

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push and open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

Built with ❤️ for campus communities. Help students reunite with their belongings!
