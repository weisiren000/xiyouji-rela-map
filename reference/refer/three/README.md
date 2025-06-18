# Three.js GLB Model Viewer

A simple application to view GLB 3D models using Three.js.

## Setup

1. Install dependencies:
```
npm install
```

2. Start the server:
```
npm start
```

3. Open your browser and navigate to:
```
http://localhost:5050
```

## Features

- Loads GLB models from the model directory
- Provides orbit controls to rotate and zoom
- Automatically centers and scales models
- Responsive design that adapts to window size

## Adding Your Own Models

Place your GLB models in the `model` directory and update the file path in `js/app.js` if needed. 