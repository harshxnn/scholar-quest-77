# ScholarAI

ScholarAI is an intelligent academic research assistant designed to provide deeply analytical, accurate, and synthesized answers. It leverages the power of Large Language Models (Gemini), dynamic tools (ArXiv, Internet Search, and PDF context retrieval), and a modern web interface to assist researchers and students.

## Architecture

This project is built using a modern, decoupled architecture:

*   **Frontend**: Built with Vite, TypeScript, React, shadcn-ui, and Tailwind CSS.
*   **Backend Server**: An Express.js Node application that handles API requests and file uploads (Multer).
*   **AI Agent**: A robust Python orchestration script (`agent.py`) using LangChain and `uv`. It dynamically creates an isolated virtual environment to execute queries using Gemini models and various tools (FAISS for vector storage, Tavily for search, PyPDF for document parsing).

## Prerequisites

To run this project locally, you need the following installed:

*   **Node.js & npm**: [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
*   **Python 3.12+**: Required for the AI agent backend.
*   **uv**: The blazing-fast Python package installer and resolver. Install via `curl -LsSf https://astral.sh/uv/install.sh | sh` or [follow the official guide](https://github.com/astral-sh/uv).
*   **API Keys**: You will need keys for Google Gemini (`GOOGLE_GEMINI_API_KEY`), Tavily (`TAVILY_API_KEY`), and potentially Groq (`GROQ_API_KEY` for fallback).

## Local Development Setup

1.  **Clone the repository:**
    ```sh
    git clone <YOUR_GIT_URL>
    cd scholar-quest-77
    ```

2.  **Environment Variables:**
    Create a `.env` file in the `server` directory and add your API keys:
    ```env
    # server/.env
    PORT=3001
    GOOGLE_GEMINI_API_KEY=your_gemini_api_key_here
    TAVILY_API_KEY=your_tavily_api_key_here
    ```

3.  **Install Frontend Dependencies & Run:**
    In the root directory:
    ```sh
    npm install
    npm run dev
    ```

4.  **Install Backend Dependencies & Run:**
    Open a new terminal window, navigate to the `server` directory:
    ```sh
    cd server
    npm install
    npm start
    ```
    *Note: The Python dependencies for the Langchain agent are handled automatically and statelessly by `uv run` when the Node.js server invokes the agent.*

## Usage

1.  Access the web interface at `http://localhost:8080` (or whichever port Vite uses).
2.  Configure your Active Sources (e.g., Internet, Papers) and Add-ons (e.g., Methodology focus).
3.  Optionally, upload PDF documents for context.
4.  Enter your research query in the chat!

## Deployment

The frontend can be built using `npm run build` and deployed to any static host supporting Vite (Vercel, Netlify). The backend requires a Node.js environment capable of executing Python child processes (e.g., Render, Railway, or a traditional VPS).
