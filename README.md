# Bangalore Pincode Explorer

A full-stack postal exploration web application for Bengaluru (Bangalore), Karnataka. Users can search by entering either a 6-digit postal pincode or an area/locality name to retrieve matching postal records, districts, and locality mappings.

Built as an assignment project by **Anshu Raj**.

---

## Features

- **Search by 6-Digit Pincode**: Exact matching for valid 6-digit numeric postal codes (e.g. `560048` returns Mahadevapura and Hoodi).
- **Search by Area Name**: Case-insensitive partial matching (e.g. `white` or `Whitefield` returns Whitefield `560066`).
- **Interactive Quick Chips**: Instant shortcuts for popular Bangalore tech hubs and residential areas (Whitefield, Koramangala, Indiranagar, HSR Layout, Electronic City, Bellandur).
- **Rich Card Results**: Displays locality name, district tag, 6-digit pincode pill, 1-click clipboard copy button, and direct Google Maps shortcut.
- **Robust Validation & Error Handling**:
  - Rejects empty queries with helpful messages.
  - Validates numeric inputs to ensure exactly 6 digits.
  - Handles non-matching queries with actionable tips and suggestions.
  - Resilient against backend disconnects with retry capability.
- **Modern Responsive Design**: Centered max-width container, sleek dark mode with ambient glow effects, responsive card grid, and full mobile optimization.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 18, Vite, CSS3, Lucide React | Modern component-based search UI, result cards, responsive micro-interactions |
| **Backend** | Node.js, Express.js, CORS | REST API, input validation, search & filtering algorithm |
| **Data** | JSON dataset (`data/bangalore-pincodes.json`) | Lightweight Bangalore pincode-to-area mapping |
| **Dev Tooling** | `concurrently`, `npm` | Single command runner for both client and server |

---

## Architecture

```text
User Browser
     │
     ▼
React + Vite Frontend (http://localhost:5173)
     │
     │ HTTP GET /api/search?q=...
     ▼
Node.js + Express REST API (http://localhost:4000)
     │
     ▼
data/bangalore-pincodes.json
     │
     ▼
Filtered JSON Response  ──►  React Result Cards
```

### Why this architecture?
1. **Separation of Concerns**: True client-server decoupling demonstrates realistic production patterns.
2. **Fast & Deterministic**: Uses a local JSON dataset without requiring heavy database installations for local review.
3. **Extensible**: The Express filtering layer can be replaced by a PostgreSQL/MongoDB query or Elasticsearch without changing the frontend contract.

---

## API Documentation

Base URL: `http://localhost:4000`

### 1. Search Pincodes or Areas
- **Endpoint**: `GET /api/search`
- **Query Parameter**: `q` (string, required)

#### Example Request (Pincode):
```bash
curl "http://localhost:4000/api/search?q=560048"
```

#### Example Response (200 OK):
```json
{
  "query": "560048",
  "type": "pincode",
  "count": 2,
  "results": [
    {
      "pincode": "560048",
      "area": "Mahadevapura",
      "district": "Bengaluru Urban"
    },
    {
      "pincode": "560048",
      "area": "Hoodi",
      "district": "Bengaluru Urban"
    }
  ]
}
```

#### Example Request (Area Name):
```bash
curl "http://localhost:4000/api/search?q=Whitefield"
```

#### Example Response (200 OK):
```json
{
  "query": "Whitefield",
  "type": "area",
  "count": 1,
  "results": [
    {
      "pincode": "560066",
      "area": "Whitefield",
      "district": "Bengaluru Urban"
    }
  ]
}
```

#### Validation Error (400 Bad Request):
```bash
curl "http://localhost:4000/api/search?q=5600"
```
```json
{
  "message": "A pincode must contain exactly 6 digits."
}
```

---

### 2. Popular Bangalore Locations
- **Endpoint**: `GET /api/popular`
- **Response (200 OK)**:
```json
{
  "popular": [
    "Whitefield",
    "Koramangala",
    "Indiranagar",
    "HSR Layout",
    "Electronic City",
    "Bellandur"
  ]
}
```

---

### 3. Health Check
- **Endpoint**: `GET /api/health`
- **Response (200 OK)**:
```json
{
  "ok": true,
  "service": "bangalore-pincode-explorer-api"
}
```

---

## Run Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- `npm` (comes with Node.js)

### Installation

1. Clone or navigate to the repository directory:
   ```bash
   cd "Assignment 2"
   ```

2. Install all dependencies (root, server, and client):
   ```bash
   npm run install:all
   ```

3. Start both Backend (`:4000`) and Frontend (`:5173`) concurrently:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

---

## Project Structure

```text
bangalore-pincode-explorer/
├── api/
│   └── index.js                 # Vercel serverless function entrypoint
├── client/
│   ├── src/
│   │   ├── App.jsx              # Search input, UI state, result cards, popular chips
│   │   ├── main.jsx             # React DOM root render
│   │   └── styles.css           # Modern CSS styling, dark theme, responsive grid
│   ├── index.html               # HTML5 template & font setup
│   ├── package.json             # React, Vite, Lucide React dependencies
│   └── vite.config.js           # Vite dev configuration & backend proxy
├── server/
│   ├── src/
│   │   └── index.js             # Express REST API, CORS, input validation, search algorithm
│   └── package.json             # Server dependencies (Express, CORS)
├── data/
│   └── bangalore-pincodes.json  # Curated Bangalore pincode dataset
├── .gitignore                   # Git ignore for node_modules, build artifacts, env
├── package.json                 # Root npm orchestrator with concurrently scripts
├── vercel.json                  # Vercel monorepo deployment & routing configuration
└── README.md                    # Project blueprint and documentation
```

---

## Deploy to Vercel

The project is fully pre-configured for **1-click Vercel deployment** as a full-stack application:

1. Import this repository [`https://github.com/anshuraj008/Assignment-2`](https://github.com/anshuraj008/Assignment-2) in your [Vercel Dashboard](https://vercel.com/new).
2. Keep the root directory as `./`.
3. Vercel automatically detects `vercel.json`:
   - **Build Command**: `npm run build --prefix client`
   - **Output Directory**: `client/dist`
   - **API Routes**: Automatically served via `/api` serverless function in `api/index.js`.
4. Click **Deploy**. Both the React frontend and Express backend will go live together with no additional setup required!

---

## Data Notes

The dataset stored in `data/bangalore-pincodes.json` is a curated demonstration subset of Bangalore postal records covering major IT hubs, commercial zones, and residential sectors (such as Whitefield, Mahadevapura, Hoodi, Koramangala, Indiranagar, HSR Layout, Electronic City, Jayanagar, Malleswaram, etc.).

All pincodes are stored as strings to preserve formatting and prevent leading-zero truncation.

---

## Future Improvements

- **Database Migration**: Move postal records to PostgreSQL with GIN indexes and trigram extension (`pg_trgm`) for fuzzy searching and typo tolerance.
- **Typeahead Autocomplete**: Debounced typeahead search suggestions in real-time as the user types.
- **Pagination & Infinite Scroll**: For large result sets spanning entire districts or metropolitan regions.
- **Automated Testing Suite**: Jest/Vitest unit tests for validation & backend search logic; Playwright/Cypress for end-to-end user journeys.
- **Containerization & Deployment**: Docker Compose file to spin up client and server, deployment to Vercel (client) and Render/Railway (API).
- **Security & Observability**: Rate limiting (`express-rate-limit`), Helmet security headers, structured logging (Winston/Pino), and APM health monitoring.

---

## Author

**Anshu Raj**  
Full-Stack Developer
