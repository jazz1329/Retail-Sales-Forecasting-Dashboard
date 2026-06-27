# 🚀 PredictiveRetail: AI-Powered Retail Sales Forecasting Dashboard

PredictiveRetail is a **production-ready Full Stack AI-powered Retail Sales Forecasting Dashboard** that enables retailers to monitor sales performance, inventory, customer analytics, and machine learning-based sales forecasts through a modern web application.

Built using **FastAPI, React, TypeScript, SQLAlchemy, Scikit-learn, SQLite, Tailwind CSS, and Vite**, this project demonstrates a complete end-to-end SaaS application suitable for academic projects, portfolios, and full-stack development showcases.

---

# 🌐 Live Demo

### 🖥️ Frontend

https://retail-sales-forecasting-dashboard.vercel.app/

### ⚙️ Backend API

https://retail-sales-forecasting-dashboard.onrender.com

### 📚 Swagger API Documentation

https://retail-sales-forecasting-dashboard.onrender.com/docs

---

# 🔑 Demo Credentials

### Admin

**Email:** `admin@retail.com`

**Password:** `adminpassword`

### Manager

**Email:** `manager@retail.com`

**Password:** `managerpassword`

### Viewer

**Email:** `viewer@retail.com`

**Password:** `viewerpassword`

---

# ✨ Features

## 🔐 Authentication & Authorization

* JWT Authentication
* Secure Login
* Role-Based Access Control
* Admin Dashboard
* Manager Dashboard
* Viewer Dashboard

---

## 📊 Dashboard Analytics

* Revenue KPIs
* Sales KPIs
* Profit Margin
* Monthly Revenue
* Revenue Growth
* Customer Analytics
* Regional Performance
* Interactive Charts
* Sales Trend Analysis

---

## 📦 Product Management

* Add Products
* Update Products
* Delete Products
* Product Search
* Category Management
* SKU Management

---

## 👥 Customer Management

* Customer CRUD
* Customer Segmentation
* Customer Analytics
* Regional Distribution

---

## 🛒 Order Management

* Create Orders
* View Orders
* Cancel Orders
* Order History
* Automatic Total Calculation

---

## 📈 Inventory Management

* Stock Monitoring
* Low Stock Alerts
* Automatic Reorder Suggestions
* Inventory Reports

---

## 🤖 AI Sales Forecasting

* Random Forest Regression
* Sales Forecast Generation
* Forecast Visualization
* Model Retraining
* Confidence Analysis
* MAE
* RMSE
* R² Score

---

## 📁 Data Management

* CSV Import
* Excel Import
* Product Upload
* Customer Upload
* Orders Export

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* React Router
* Axios
* Recharts
* Framer Motion
* Lucide React

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
* Uvicorn

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
│   ├── package.json
│   └── vite.config.ts
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

cd Retail-Sales-Forecasting-Dashboard
```

---

## Backend Setup

### Create Virtual Environment

```bash
python -m venv venv
```

### Windows

```bash
venv\Scripts\activate
```

### macOS/Linux

```bash
source venv/bin/activate
```

### Install Dependencies

```bash
pip install -r requirements.txt
```

### Run Backend

```bash
cd backend

uvicorn app.main:app --reload
```

Backend:

```text
http://localhost:8000
```

Swagger Docs:

```text
http://localhost:8000/docs
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# ⚙️ Environment Variables

## Frontend (.env)

```env
VITE_API_URL=https://retail-sales-forecasting-dashboard.onrender.com
```

---

# 📚 API Modules

* Authentication
* Dashboard
* Products
* Customers
* Orders
* Inventory
* Forecasting
* Reports
* Data Import & Export

---

# 📊 Machine Learning

The forecasting engine uses a **Random Forest Regression** model trained on historical retail sales data to predict future sales performance.

### Evaluation Metrics

* MAE (Mean Absolute Error)
* RMSE (Root Mean Squared Error)
* R² Score

Forecasts are generated dynamically and visualized using interactive charts to help retailers make informed business decisions.

---

# ⭐ Future Enhancements

* PostgreSQL Support
* Docker Deployment
* Redis Caching
* Celery Background Tasks
* Email Notifications
* XGBoost & LSTM Forecasting
* Multi-Tenant SaaS Architecture
* AWS Deployment
* CI/CD Pipeline

---

# 👨‍💻 Author

**Jaskirat Singh**

Computer Science Engineering (Data Science)

Chandigarh University

GitHub: https://github.com/jazz1329

---

# 📄 License

This project is licensed under the MIT License.

---

# ⭐ Support

If you found this project useful, consider giving it a **⭐ Star** on GitHub to support the project and future improvements.
