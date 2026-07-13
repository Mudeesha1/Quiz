# File Upload System Documentation

## Installation

First, install multer package:
```bash
npm install multer
```

## Folder Structure

```
backend/
├── uploads/
│   ├── quiz-questions/    # Quiz question images (5 MB max)
│   ├── papers/            # PDF papers (50 MB max)
│   ├── badges/            # Badge images (2 MB max)
│   └── profiles/          # User profile pictures (3 MB max)
├── config/
│   └── upload.config.js   # Upload configuration
├── middleware/
│   └── fileUpload.js      # Multer middleware
└── modules/uploads/
    └── uploads.routes.js  # Upload API routes
```

## API Endpoints

### Upload Quiz Question Image
**POST** `/api/v1/uploads/quiz-questions`
- **Auth:** Required (Bearer token)
- **Content-Type:** multipart/form-data
- **Field Name:** `file`
- **Allowed Types:** JPEG, PNG, WebP
- **Max Size:** 5 MB
- **Response:**
```json
{
  "status": "success",
  "message": "Quiz question image uploaded successfully",
  "data": {
    "filename": "question-name-1733100000-123456789.png",
    "originalName": "question.png",
    "url": "/api/v1/uploads/quiz-questions/question-name-1733100000-123456789.png",
    "size": 45678
  }
}
```

### Upload Paper PDF
**POST** `/api/v1/uploads/papers`
- **Auth:** Required (Bearer token)
- **Content-Type:** multipart/form-data
- **Field Name:** `file`
- **Allowed Types:** PDF
- **Max Size:** 50 MB
- **Response:** Same structure as above

### Upload Badge Image
**POST** `/api/v1/uploads/badges`
- **Auth:** Required (Bearer token)
- **Content-Type:** multipart/form-data
- **Field Name:** `file`
- **Allowed Types:** JPEG, PNG, WebP, SVG
- **Max Size:** 2 MB
- **Response:** Same structure as above

### Upload Profile Picture
**POST** `/api/v1/uploads/profiles`
- **Auth:** Required (Bearer token)
- **Content-Type:** multipart/form-data
- **Field Name:** `file`
- **Allowed Types:** JPEG, PNG, WebP
- **Max Size:** 3 MB
- **Response:** Same structure as above

### Delete Uploaded File
**DELETE** `/api/v1/uploads/:type/:filename`
- **Auth:** Required (Bearer token)
- **Path Parameters:**
  - `type`: quiz-questions, papers, badges, profiles
  - `filename`: Filename to delete (e.g., "question-name-1733100000-123456789.png")
- **Response:**
```json
{
  "status": "success",
  "message": "File deleted successfully"
}
```

## Frontend Upload Example

### Using Fetch API
```javascript
const uploadQuestionImage = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/v1/uploads/quiz-questions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`
    },
    body: formData
  });

  const data = await response.json();
  return data.data.url;
};
```

### Using Axios
```javascript
import axios from "axios";

const uploadPaperPDF = async (file, accessToken) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await axios.post(
    "/api/v1/uploads/papers",
    formData,
    {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "multipart/form-data"
      }
    }
  );

  return response.data.data.url;
};
```

## Database Usage

### Storing Image URLs in Database

```javascript
// When creating a quiz question
const question = await Question.create({
  quiz_id: quizId,
  question_text: "What is 2+2?",
  image_url: "/api/v1/uploads/quiz-questions/question-name-1733100000-123456789.png",
  question_order: 1
});

// When creating a paper
const paper = await Paper.create({
  title: "Grade 5 Mathematics - Paper 1",
  image_url: "/api/v1/uploads/papers/paper-cover-1733100000-123456789.png",
  pdf_url: "/api/v1/uploads/papers/paper-pdf-1733100000-123456789.pdf",
  subjects_has_years_id: 1
});

// When creating a badge
const badge = await Badge.create({
  name: "Perfect Score",
  description: "Score 100% on a quiz",
  icon_url: "/api/v1/uploads/badges/perfect-score-1733100000-123456789.png"
});
```

## Configuration

All upload settings can be modified in `backend/config/upload.config.js`:

```javascript
// Change max file size
MAX_FILE_SIZES: {
  QUIZ_QUESTIONS: 10 * 1024 * 1024, // 10 MB
  // ...
}

// Add more allowed file types
ALLOWED_MIME_TYPES: {
  QUIZ_QUESTIONS: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  // ...
}
```

## Error Handling

### Common Errors

1. **No file uploaded**
   ```json
   {
     "status": "fail",
     "message": "No file uploaded"
   }
   ```

2. **Invalid file type**
   ```json
   {
     "status": "fail",
     "message": "Invalid file type. Allowed: image/jpeg, image/png, image/webp"
   }
   ```

3. **File too large**
   - Express/Multer will automatically reject files exceeding max size

4. **Unauthorized**
   ```json
   {
     "status": "fail",
     "message": "Unauthorized"
   }
   ```

## Serving Files

Files are automatically served through the `/api/v1/uploads/:type/:filename` endpoint with CORS enabled.

### File URL Format
```
/api/v1/uploads/quiz-questions/filename.png
/api/v1/uploads/papers/filename.pdf
/api/v1/uploads/badges/filename.png
/api/v1/uploads/profiles/filename.jpg
```

## Security Considerations

1. ✅ File type validation (whitelist approach)
2. ✅ File size limits
3. ✅ Authentication required for all upload operations
4. ✅ Directory traversal attack prevention
5. ✅ Unique filename generation to prevent overwrites
6. ✅ Uploaded files excluded from git (via .gitignore)

## Cleanup

To clean up old/unused files:
```bash
# Find files older than 30 days
find backend/uploads -type f -mtime +30 -delete
```

Or create a scheduled job to remove stale files automatically.
