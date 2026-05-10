# Wallet — React + Vite + Tanstack Query

A modern fintech wallet app with sign-in / sign-up / dashboard.

## Stack

- **Vite** + **React 18**
- **React Router 6** (signin / signup / home)
- **Tanstack Query 5** (`useMutation` for auth, `useQuery` for wallets)
- **Axios** with auth-token interceptor & 401 refresh-token handling

## Setup

```bash
cd wallet-app
npm install
npm run dev
```

Open http://localhost:5173

## Configure API base URL

Copy `.env.example` to `.env` and edit:

```
VITE_API_BASE_URL=http://localhost:8080
```

## API endpoints used

| Action       | Method | URL                  |
| ------------ | ------ | -------------------- |
| Register     | POST   | `/api/auth/register` |
| Sign in      | POST   | `/api/auth/login`    |
| Sign out     | POST   | `/api/auth/logout`   |
| Sign out all | POST   | `/api/auth`          |

Tokens are stored in `localStorage` (`wallet.accessToken`, `wallet.refreshToken`)
and the access token is attached automatically to every request via an Axios
interceptor.

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
src/
├── api/
│   ├── client.js         # Axios instance + interceptors
│   └── auth.js           # register / login / logout fns
├── hooks/
│   ├── useAuth.jsx       # Auth context + provider
│   └── useAuthMutations.js  # Tanstack Query mutations
├── pages/
│   ├── SignIn.jsx
│   ├── SignUp.jsx
│   └── Home.jsx
├── components/
│   ├── Icon.jsx
│   ├── ArtPanel.jsx
│   ├── WalletCard.jsx
│   ├── TransactionRow.jsx
│   ├── CreateWalletModal.jsx
│   └── AddMoneyModal.jsx
├── utils/
│   └── format.js
├── App.jsx
├── main.jsx
└── styles.css
```

``

# ──────────────────────────────────────────

# Stage 1: Build

# Use Node.js 20 (Alpine = lightweight Linux) to build the React app

# ──────────────────────────────────────────

FROM node:20-alpine AS builder

# "builder" is just a name we reference in Stage 2

WORKDIR /app

# All commands below run inside /app folder inside the container

COPY package\*.json ./

# Copy package.json & package-lock.json first (for Docker layer caching)

RUN npm ci

# Install exact dependencies from package-lock.json (faster & safer than npm install)

COPY . .

# Copy all project source files into the container

RUN npm run build

# Run "vite build" → produces optimised static files in /app/dist

# ──────────────────────────────────────────

# Stage 2: Serve

# Throw away Node.js entirely — only copy the built files into a tiny Nginx image

# Final image size ~25 MB instead of ~400 MB

# ──────────────────────────────────────────

FROM nginx:stable-alpine

# Nginx is a fast web server perfect for serving static files

COPY --from=builder /app/dist /usr/share/nginx/html

# Copy built files from Stage 1 into Nginx's serving folder

# Write a custom Nginx config to handle React Router (client-side routing).

# WHY: React Router handles navigation in the browser (e.g. /dashboard, /wallet).

# These URLs don't exist as real files on disk. Without this config, Nginx returns

# 404 when you refresh the page or open a deep link directly. The fix is:

# always serve index.html for any URL and let React Router handle the rest.

RUN printf 'server {\n\
 listen 80;\n\ # Nginx listens on port 80 inside the container\
 root /usr/share/nginx/html;\n\ # Folder where our built React files live\
 index index.html;\n\ # Default file to serve\
 location / {\n\
 try_files $uri $uri/ /index.html;\n\ # Try the real file first; if not found, serve index.html\
 }\n\
}\n' > /etc/nginx/conf.d/default.conf

# Overwrite Nginx default config with ours

EXPOSE 80

# Document that the container listens on port 80 (mapped to host port 3000 via docker run -p 3000:80)

CMD ["nginx", "-g", "daemon off;"]

# Start Nginx in the foreground (required for Docker to keep the container alive)

``
