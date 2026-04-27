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
