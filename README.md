<div align="center">
  <h1>📚 Library Management System</h1>
  <p>A modern, single-page web application for managing a small library, built with vanilla JavaScript and a Node.js backend.</p>
</div>

---

## ✨ Features

**Book Management:**
- 📖 **Add & Remove Books:** Easily add new books to the library collection or remove them.
- 🔍 **Dynamic Search:** Instantly search for books by title or author.
- 📂 **Category Filtering:** Filter the book collection by category (Fiction, Science, etc.).

**Circulation:**
- 📤 **Issue Books:** Check out books to students by recording their name and ID.
- 📥 **Return Books:** Check in returned books.
- 💰 **Automatic Fine Calculation:**
  - See a "Potential Fine" calculated in real-time before completing a return.
  - Fines are automatically calculated and logged upon returning an overdue book.

**Reporting & Tracking:**
- 💵 **Outstanding Fines:** View a dedicated tab that lists all students who currently have overdue books, with a clear breakdown of their total fine.
- 🏛️ **Student History:** Look up any student by their ID to see their complete borrowing history, including all issued books, return dates, and total fines paid.
- 📋 **Live Issued Books List:** See a table of all books that are currently checked out.

**Technical Features:**
- 💾 **JSON Database:** All data is persisted in simple `.json` files, managed by a lightweight Node.js/Express server.
- 🚀 **Single-Page Application (SPA):** A fast and responsive user interface with tab-based navigation that doesn't require page reloads.
- 🎨 **Modern UI:** A clean, intuitive, and modern user interface.

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Development:** nodemon for automatic server restarts

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

Make sure you have Node.js installed on your system. You can download it from the official website. This will also install `npm` (Node Package Manager).

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/library-management.git
    cd library-management
    ```

2.  **Install dependencies:**
    This command will install all the necessary packages for the server (like Express).
    ```bash
    npm install
    ```

3.  **Run the server:**
    This command starts the Node.js server, which will serve the application and handle data requests.
    ```bash
    npm start
    ```
    For development, you can use `nodemon` for auto-reloading the server on file changes:
    ```bash
    npm run dev
    ```

4.  **Open the application:**
    Once the server is running, open your web browser and navigate to:
    http://localhost:3000

## 📁 How Data is Stored

The application uses a simple file-based storage system. All data is stored in two JSON files located in the `/file` directory:

- `books.json`: Contains the list of all books in the library.
- `issued_books.json`: Contains the records of all books that have been issued to students, including return dates and fines.

The Node.js server is responsible for reading from and writing to these files.