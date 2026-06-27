# 🚀 PredictiveRetail: AI Sales Forecasting Dashboard

PredictiveRetail is a **production-ready Full Stack AI-powered Retail Sales Forecasting Dashboard** that enables retailers to monitor sales, inventory, customer analytics, and machine learning-based sales forecasts through an interactive web application.

The application is built using **FastAPI**, **React**, **TypeScript**, **SQLAlchemy**, **Scikit-learn**, and **SQLite**, making it suitable for both academic projects and portfolio demonstrations.

---

# 🌐 Live Demo

### 🖥️ Frontend

**https://retail-sales-forecasting-dashboard.vercel.app/**

### ⚙️ Backend API

**https://retail-sales-forecasting-dashboard.onrender.com**

### 📚 Swagger API Documentation

**https://retail-sales-forecasting-dashboard.onrender.com/docs**

---

# ✨ Features

## 🔐 Authentication & Authorization

* JWT Authentication
* Role-Based Access Control
* Admin
* Manager
* Viewer

---

## 📊 Dashboard Analytics

* Revenue KPIs
* Sales KPIs
* Average Order Value
* Profit Margin
* Growth Percentage
* Customer Analytics
* Revenue Trends
* Monthly Sales Charts
* Region-wise Analysis

---

## 📦 Product Management

* Create Products
* Update Products
* Delete Products
* Product Search
* Category Management
* SKU Management

---

## 👥 Customer Management

* Customer CRUD
* Customer Segmentation
* Regional Analysis

---

## 🛒 Order Management

* Create Orders
* View Orders
* Cancel Orders
* Order Details
* Automatic Total Calculation

---

## 📈 Inventory Management

* Stock Monitoring
* Low Stock Detection
* Automatic Reorder
* Bulk Reorder

---

## 🤖 AI Sales Forecasting

* Random Forest Regressor
* Forecast up to 365 Days
* Confidence Intervals
* Model Retraining
* MAE
* RMSE
* R² Score
* Forecast Charts

---

## 📁 Data Import & Export

* CSV Upload
* Excel Upload
* Product Import
* Customer Import
* Orders Export

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Axios
* Recharts
* Framer Motion
* Lucide Icons

---

## Backend

* Python
* FastAPI
* SQLAlchemy
* Pydantic
* JWT Authentication
* Pandas
* NumPy
* Scikit-learn

---

## Database

* SQLite

---

## Deployment

* Vercel
* Render
* GitHub

---

# 📂 Project Structure

```text
Retail-Sales-Forecasting-Dashboard
│
├── backend
│   ├── app
│   │   ├── routers
│   │   ├── auth.py
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── forecaster.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── main.py
│   │
│   └── tests
│
├── frontend
│   ├── src
│   ├── public
│   └── vite.config.ts
│
├── database
│   └── db_init.py
│
├── dataset
├── requirements.txt
└── README.md
```

---

# 🚀 Local Installation

## Clone Repository

```bash
git clone https://github.com/jazz1329/Retail-Sales-Forecasting-Dashboard.git
```

```bash
cd Retail-Sales-Forecasting-Dashboard
```

---

## Backend

Create Virtual Environment

```bash
python -m venv venv
```

Activate Environment

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

Install Dependencies

```bash
pip install -r requirements.txt
```

Run Backend

```bash
cd backend

uvicorn app.main:app --reload
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# 📚 API Endpoints

### Authentication

* Register
* Login

### Dashboard

* KPIs
* Charts

### Products

* CRUD Operations

### Customers

* CRUD Operations

### Orders

* CRUD Operations

### Inventory

* Stock Monitoring
* Reorder

### Forecast

* Forecast Data
* Retrain Model
* Forecast Metrics

### Data

* Upload CSV/Excel
* Export Orders

---

# 📊 Machine Learning

The forecasting module uses **Random Forest Regression** trained on historical retail sales data.

Evaluation Metrics include:

* MAE
* RMSE
* R² Score

Forecasts are automatically generated for future sales periods and visualized within the dashboard.

---

# 📸 Screenshots

Add screenshots of:

* Landing Page
* Dashboard
* Analytics
* Forecast
* Inventory
* Login
* Orders
* Products

---

# ⭐ Future Improvements

* PostgreSQL Support
* Docker Deployment
* Redis Caching
* Celery Background Jobs
* Email Notifications
* Advanced ML Models
* Multi-Tenant SaaS Architecture
* AWS Deployment

---

# 👨‍💻 Author

**Jaskirat Singh**

GitHub:
https://github.com/jazz1329

---

# ⭐ If you like this project

Please consider giving it a **Star ⭐** on GitHub.
