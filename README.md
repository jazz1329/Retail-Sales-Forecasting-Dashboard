# PredictiveRetail: AI Sales Forecasting Dashboard

PredictiveRetail is a production-quality, commercial-grade Full Stack Retail Sales Forecasting Dashboard. It utilizes machine learning models to analyze seasonality, customer segments, and order data, providing actionable retail forecasts up to a year in advance.

The architecture is built upon a **React 19 + TypeScript** frontend with a **FastAPI (Python) + SQLAlchemy** backend, supporting out-of-the-box local executions via **SQLite** as well as full-scale commercial deployments using **MySQL** inside Docker containers.

---

## 🌟 Key Features

### 💻 User Interface & Dashboards
*   **Modern SaaS landing page**: Clean branding, dynamic product feature cards, and direct CTAs.
*   **Overview Dashboard**: Real-time sales KPI counters (Revenue, Units Sold, Avg Order Value, Margins) with interactive filters (Store, Region, Category, Year, Quarter).
*   **Analytics Room**: Detailed stacked trend charts (Revenue vs Net Profit margins), customer segment ratios, and geographic demand distributions.
*   **Weekday Sales Heatmap**: Grid highlighting transaction density mapping weekdays (0-6) against active Store Hubs.

### 🔮 Machine Learning & Forecasting
*   **ML Projections**: Composed Recharts timeline mapping historical sales alongside dotted prediction forecasts, complete with confidence interval bands.
*   **Active Pipeline Retraining**: Choose forecasting horizon (30 to 365 days) and retrain the Random Forest model directly from the UI.
*   **Performance Metrics Dashboard**: Real-time feedback displaying R² score, Mean Absolute Error (MAE), and Root Mean Squared Error (RMSE) on the active model.

### 📦 ERP & Inventory Management
*   **Live Order Invoicing**: Form drawer verifying current product stock before compiling billing transactions.
*   **Inventory Auditing & Restocking**: Identify low-stock warnings instantly. Restock single items (+50 units) or bulk-restock all warning alerts.
*   **File Upload Center**: Parse and seed directory sheets for products and customers via Excel/CSV imports.
*   **CSV Streaming Exports**: Expose entire transaction history as downloadable spreadsheets.

---

## 🛠️ Technology Stack

*   **Frontend**: React 19, Vite, Tailwind CSS, TypeScript, React Router v6, Axios, Recharts, Lucide Icons, Framer Motion.
*   **Backend**: Python 3.11+, FastAPI, SQLAlchemy ORM, Pandas, NumPy, Scikit-learn (RandomForestRegressor).
*   **Database**: SQLite (default developer mode), MySQL (production configuration).
*   **Deployment**: Docker, Docker Compose, Nginx.

---

## 📂 Folder Structure

```text
retail_sales_forecasting/
├── backend/                  # FastAPI Application Source
│   ├── app/
│   │   ├── config.py         # Configs (JWT settings, DB URL, CORS)
│   │   ├── database.py       # SQLAlchemy Connection configurations
│   │   ├── models.py         # Normalized SQL Schemas
│   │   ├── schemas.py        # Pydantic payloads validation
│   │   ├── auth.py           # JWT generation and Role checks
│   │   ├── forecaster.py     # ML Random Forest modeling pipelines
│   │   ├── routers/          # Route handlers
│   │   │   ├── auth.py, dashboard.py, products.py, customers.py,
│   │   │   └── orders.py, inventory.py, forecast.py, data.py
│   │   └── main.py           # App server entrypoint
│   └── tests/                # Pytest unit & API endpoints tests
├── frontend/                 # React 19 Frontend Client
│   ├── src/
│   │   ├── components/       # Reusable layout cards & tables
│   │   ├── contexts/         # Authentication and light/dark theme providers
│   │   ├── pages/            # View layouts (Landing, Login, Dashboard, etc.)
│   │   ├── App.tsx           # Router allocations
│   │   └── main.tsx          # Root DOM renderer
│   ├── tailwind.config.js    # Customized CSS tokens
│   └── postcss.config.js
├── database/
│   └── db_init.py            # Database initializer & multi-year seasonal seeder
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
├── requirements.txt
└── README.md
```

---

## 🗄️ Database Schema Design

The SQL database contains normalized tables configured with primary keys, foreign constraints, and indexing:

1.  `users`: Administrative credential records (Admin, Manager, Viewer).
2.  `categories`: Product category categories (Electronics, Furniture, Groceries, etc.).
3.  `products`: Retail listings holding unit price, manufacturer cost, SKU, and stock.
4.  `customers`: Customer profiles mapped to consumer segments and geographical areas.
5.  `stores`: Active operational brick-and-mortar retail stores.
6.  `orders` & `order_items`: Customer transactional baskets linked to products and price points.
7.  `forecasts`: Predicted item demand quantities mapped to dates, stores, and confidence limits.
8.  `forecast_evaluations`: ML fit metrics (R², MAE, RMSE) of the actively saved model.

---

## 🚀 Installation & Local Execution

### 1. Backend Local Setup (Quick Developer Mode)
Ensure Python 3.10+ is installed:
```bash
# Move to workspace
cd retail_sales_forecasting

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install email-validator

# Initialize tables and seed 2.5 years of seasonal historical data
python database/db_init.py

# Run FastAPI app server (default runs on http://localhost:8000)
PYTHONPATH=backend uvicorn backend.app.main:app --reload
```

### 2. Run Backend Tests
Ensure your virtual environment is active:
```bash
PYTHONPATH=backend pytest backend/tests/
```

### 3. Frontend Local Setup
Ensure Node.js 18+ is installed:
```bash
# Navigate to frontend client
cd frontend

# Install package dependencies
npm install

# Start Vite hot-reload server (runs on http://localhost:5173)
npm run dev
```

---

## 🐳 Docker Deployment (Full MySQL Mode)

For a commercial SaaS environment running MySQL, boot the containers:
```bash
# Spin up MySQL db, Nginx frontend, and FastAPI backend services
docker-compose up --build
```
The compose script will:
1.  Initialize a MySQL database container.
2.  Boot the FastAPI server, wait 10 seconds for the DB, initialize tables, seed the database with 2300+ orders, train the Random Forest forecasting model, and launch the API server on port `8000`.
3.  Compile frontend assets and serve them via Nginx on port `80`.
