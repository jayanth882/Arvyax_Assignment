# AI-Assisted Journal System

This is a full-stack application designed to help you keep track of your thoughts and experiences. You can write journal entries about your time in nature, and the system uses Google Gemini AI to analyze your entries for emotions, key themes, and summaries.

---

## Key Features

- **Nature-Based Journaling**: You can choose between different settings like Forest, Ocean, or Mountain to set the tone for your journal entry.
- **AI Analysis**: The system uses Google Gemini to automatically look at your text and pick out:
  - **Emotions**: It identifies the main feeling of your entry.
  - **Keywords**: It lists the important topics you mentioned.
  - **Summary**: It gives you a short overview of what you wrote.
- **Insights Dashboard**: You can see patterns and combined data from your past entries to help you understand your emotional trends over time.

---

## Technical Stack

- **Frontend**: Built with React and Vite for a fast and smooth user interface.
- **Backend**: Uses Node.js and Express to handle the API and logic.
- **Database**: Uses SQLite, which is easy to set up and move around.
- **AI**: Integrated with the Google Gemini API for natural language processing.

---

## Setup and Installation

### 1. What You Need
- **Node.js** (version 16 or newer)
- **npm** (this comes with Node)
- **Google Gemini API Key** (I've included instructions on how to get this below)

### 2. Setting Up the Backend
1. Go to the backend folder:
   ```bash
   cd backend
   ```
2. Install the necessary packages:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   Open the `.env` file and put your API key in:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

#### How to get a Google Gemini API Key:
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Click on "Get API key" in the side menu.
4. Click "Create API key". You might need to select a project or just create a new one.
5. Copy the key and paste it into the `backend/.env` file.

4. Start the backend server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:5000` and will create the `database.db` file automatically.

### 3. Setting Up the Frontend
1. Open a new terminal window and go to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install the frontend packages:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   You can then open the app at `http://localhost:5173`.

---

## API Summary

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| /api/journal | POST | Saves a new journal entry |
| /api/journal/:userId | GET | Gets all entries for a certain user |
| /api/journal/analyze | POST | Uses the AI to analyze text for feelings and keywords |
| /api/journal/insights/:userId | GET | Gets a summary of emotional data over time |

---

## License
Created for the Arvyax Assignment.