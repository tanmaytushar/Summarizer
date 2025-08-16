# Meeting Transcript Summarizer

A full-stack application that automatically generates summaries of meeting transcripts using AI. Upload or paste your meeting notes and get intelligent summaries with easy sharing capabilities.

## Features

- **Multiple Input Methods**: Upload .txt files or paste text directly
- **AI-Powered Summarization**: Uses Google's Gemini API for intelligent content analysis
- **Custom Prompts**: Add custom instructions for tailored summaries
- **Rich Text Formatting**: Supports markdown formatting with bold and italic text
- **Easy Sharing**: 
  - Copy plain text or formatted summaries to clipboard
  - Share via email with rich HTML formatting
  - Automatic email composition with multiple recipients
- **Live Editing**: Edit generated summaries inline
- **Modern Dark UI**: Clean, responsive interface optimized for productivity

## Tech Stack

**Frontend:**
- React with Hooks
- Vanilla CSS with modern styling
- Clipboard API for rich text copying
- File handling for transcript uploads

**Backend:**
- Go (Golang) with Gin framework
- Google Gemini API integration
- Environment-based configuration

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd summarizer
```

### 2. Backend Setup

```bash
cd backend
go mod init meeting-summarizer
go get github.com/gin-gonic/gin
go get github.com/gin-contrib/cors
go get github.com/joho/godotenv
```

Create a `.env` file in the backend directory:

```env
AI_API_KEY=your_google_gemini_api_key_here
PORT=8080
```

### 3. Frontend Setup

```bash
cd frontend
npm install react react-dom
npm create vite@latest . -- --template react
```

## Getting Your Google Gemini API Key

1. Visit the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key to your `.env` file

## Usage

### 1. Start the Backend Server

```bash
cd backend
go run main.go
```

The server will start at `http://localhost:8080`

### 2. Start the Frontend

```bash
cd frontend
npm start
npm run dev
```

The application will open at `http://localhost:3000`

### 3. Using the Application

1. **Add Transcript**: Either upload a .txt file or paste your meeting notes
2. **Custom Prompt** (Optional): Add specific instructions like "Focus on action items" or "Summarize key decisions"
3. **Generate Summary**: Click the send button or press Enter
4. **Edit if Needed**: Use the Edit button to modify the generated summary
5. **Share**: 
   - Use "Copy" for plain text
   - Use "Copy Rich" for formatted text with markdown
   - Use email sharing for direct communication

## API Endpoints

### POST /summarize

Generates a summary from the provided transcript.

**Request Body:**
```json
{
  "transcript": "Meeting content here...",
  "prompt": "Custom summarization instructions (optional)"
}
```

**Response:**
```json
{
  "summary": "Generated summary with key points..."
}
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `AI_API_KEY` | Google Gemini API key | Required |
| `PORT` | Backend server port | 8080 |


## File Structure

```
meeting-summarizer/
├── backend/
│   ├── main.go
│   ├── .env
│   └── go.mod
├── frontend/
│   ├── src/
│   │   └── App.jsx
│   ├── package.json
│   └── public/
└── README.md
```

## Troubleshooting

### Common Issues

**"AI_API_KEY not set" Error:**
- Ensure your `.env` file is in the backend directory
- Verify the API key is correctly formatted
- Restart the backend server after adding the key

**File Upload Issues:**
- Only .txt files are supported for upload
- Ensure the file contains readable text content





