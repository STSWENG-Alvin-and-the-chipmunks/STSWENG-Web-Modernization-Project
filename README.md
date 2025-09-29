# MARS Group Salon Web Modernization Project

## Project Overview

This project modernizes the DOT ZERO Hair Salon and MARS Group of Salons website by implementing key features:

*   **Blog Post Management:** Staff can create, read, update, and delete blog posts.
*   **Commenting Functionality:** Logged-in users can engage with blog content through comments.
*   **User Roles & Permissions:** A refined system for Admin, Manager, and User roles ensures secure content management.

The goal is to provide a dynamic, intuitive, and secure web platform that enhances client experience and strengthens MARS Group's online presence.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose
*   **Frontend:** Handlebars (for server-side rendering views)
*   **Authentication:** JWT (JSON Web Tokens) with bcryptjs

## Getting Started

### Prerequisites

1.  **Node.js** (latest LTS recommended)
2.  **npm** (comes with Node.js)
3.  A configured **MongoDB connection string** (already updated in `server.js` or set via environment variables).

### Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd MARS-Group-Salon-Web-Modernization-Project
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm start
    ```

4.  **Open the site:**
    Visit `http://localhost:8000` in your web browser.
