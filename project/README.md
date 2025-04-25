# Waste Segregation Application

An intelligent waste classification system that helps users identify and categorize different types of waste materials.

## Features

- Real-time waste classification using AI
- Detailed eco-impact statistics
- User-friendly interface
- Historical waste trend analysis
- System health monitoring
- Bin level tracking

## Requirements

- Python 3.8 or higher
- Node.js and npm
- Required Python packages:
  - Flask
  - Flask-CORS
  - TensorFlow
  - NumPy
  - Pillow

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/waste-segregation.git
   cd waste-segregation
   ```

2. Install Python dependencies:
   ```
   pip install flask flask-cors tensorflow numpy pillow
   ```

3. Install Node.js dependencies:
   ```
   cd project/src
   npm install
   ```

## Running the Application

### Method 1: Using the Startup Script (Recommended)

Run the startup script from the project root directory:

```
cd project
python start.py
```

This script will:
- Check for required directories and packages
- Start the Flask server
- Start the React client
- Open the application in your default web browser

### Method 2: Running Components Separately

#### Start the Flask Server

```
cd project/server
python app.py
```

#### Start the React Client

```
cd project/src
npm start
```

## Using the Application

1. The application will open in your default web browser at http://localhost:3000
2. Use the "Upload Image" button to upload an image of waste
3. The AI will classify the waste and provide details
4. View statistics and trends in the dashboard

## API Endpoints

The server provides the following API endpoints:

- `GET /api/health` - Check server and model status
- `POST /api/classify` - Classify waste from an image
- `GET /api/training-status` - Check model training status
- `POST /api/train` - Trigger model training

## Development

- Server code is located in `project/server/`
- Frontend React code is in `project/src/`
- AI model code is in `project/models/`

## Troubleshooting

- If the server fails to start, check that all required Python packages are installed
- If the client fails to start, make sure Node.js and npm are properly installed
- For classification issues, verify that the model files are present in the `project/models/` directory

## License

This project is licensed under the MIT License - see the LICENSE file for details. 