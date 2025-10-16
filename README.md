# 📦 Simple Share

**Simple Share** is an easy-to-use web service for uploading and sharing files.
Just upload your file → get a download link → share it.

## ✨ Features

- 🔐 User authorization with JWT and cookies
- 📂 File uploads up to 100 MB
- 📊 View file statistics (administrator only)
- 🖥 User-friendly web interface

![Express](https://img.shields.io/badge/Express.js-000000?logo=express&logoColor=white&style=for-the-badge)
![TypeScript](https://shields.io/badge/TypeScript-3178C6?logo=TypeScript&logoColor=FFF&style=for-the-badge)

## 📷 Demo

![UI](./assets/screenshot.png)

## 🚀 Install

1. Clone repository
```bash
git clone https://github.com/acidless/simple-share.git
cd simple-share
```
2. Install dependencies
```bash
npm install
```
3. You can configure the environment by creating a .env file in the project root.
Default environment parameters:
```.env
PORT=3000
JWT_SECRET=secret
ADMIN_EMAIL=admin@example.com
RETENTION_DAYS=30
BASE_URL=http://localhost:3000
```
4. Start the server
```bash
npm start
```

## 📜 License
MIT License © 2025
