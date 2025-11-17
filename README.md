# Livestock Management System

A comprehensive web-based application designed to help farmers and agricultural organizations efficiently track livestock, manage records, and monitor key operational data including breeds, feeding schedules, health status, and growth metrics.

## 📋 Overview

The Livestock Management System provides a centralized platform for managing livestock operations, enabling users to maintain detailed records, track health histories, and generate insights for better farm management decisions.

## ✨ Features

- **Livestock Records Management** - Create, read, update, and delete livestock records with detailed information
- **Breed & Type Categorization** - Organize animals by breed, species, and classification
- **Health Monitoring** - Track medical history, vaccinations, and treatment schedules
- **Feeding Management** - Monitor feeding schedules and nutritional requirements
- **Performance Metrics** - Analyze farm productivity and livestock growth trends
- **Admin Dashboard** - Centralized control panel for system management and reporting
- **User Authentication** - Secure login with role-based access control

## 🛠️ Tech Stack

**Frontend:**
- HTML5
- CSS3
- JavaScript

**Backend:**
- PHP 7.4+

**Database:**
- MySQL 5.7+

**Development Environment:**
- XAMPP / WAMP Server

## 📦 Installation

### Prerequisites

- XAMPP or WAMP installed on your machine
- Web browser (Chrome, Firefox, Edge, etc.)
- Basic knowledge of PHP and MySQL

### Setup Instructions

1. **Download/Clone the Repository**
   ```bash
   git clone https://github.com/Ka-lang227/livestockMngt.git
   ```

2. **Move Project to Server Directory**
   - Copy the project folder to your XAMPP `htdocs` directory
   - Path: `C:\xampp\htdocs\livestock-mngt` (Windows)
   - Path: `/Applications/XAMPP/htdocs/livestock-mngt` (Mac)

3. **Create Database**
   - Open phpMyAdmin: `http://localhost/phpmyadmin`
   - Create a new database named `livestock_db`
   - Import the SQL file: `database/livestock_db.sql`

4. **Configure Database Connection**
   - Create a `config.env` file in the root directory (if not exists)
   - Add your database credentials:
     ```env
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=livestock_db
     ```
   - **Note:** Never commit `config.env` to version control

5. **Start Services**
   - Start Apache and MySQL from XAMPP/WAMP Control Panel

6. **Access Application**
   - Open your browser and navigate to: `http://localhost/livestock-mngt`

## 🚀 Usage

### Default Login Credentials
```
Username: admin
Password: admin123
```
**Important:** Change default credentials after first login.

### Basic Workflow
1. Login with your credentials
2. Navigate to the dashboard
3. Add new livestock records via "Add Animal" section
4. Update health records and feeding schedules
5. View reports and analytics

## 📁 Project Structure

```
livestock-mngt/
├── assets/
│   ├── css/
│   ├── js/
│   └── images/
├── database/
│   └── livestock_db.sql
├── includes/
│   ├── config.php
│   └── functions.php
├── admin/
│   └── dashboard.php
├── index.php
├── login.php
└── README.md
```

## 🔒 Security Notes

- Never commit sensitive files like `config.env` to version control
- Always use prepared statements to prevent SQL injection
- Regularly update passwords and credentials
- Implement HTTPS in production environments


## 👨‍💻 Author

**Kwatpan Dalang**
- Email: kwatpandavid@gmail.com
- GitHub: [@Ka-lang227](https://github.com/Ka-lang227)

## 🐛 Issues

Found a bug or have a feature request? Please open an issue [here](https://github.com/Ka-lang227/livestockMngt/issues).



---

**⭐ If you find this project helpful, please consider giving it a star!**
