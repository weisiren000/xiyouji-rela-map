const express = require('express');
const path = require('path');
const app = express();
const PORT = 5050;

// Serve static files from the root directory
app.use(express.static('./'));

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Open your browser to view the 3D model.`);
}); 