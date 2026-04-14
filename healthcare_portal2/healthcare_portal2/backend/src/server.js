const http = require('http');
const app = require('./app');
const { connectDB } = require('./config/index');

const PORT = process.env.PORT || 5000;

const cors = require('cors');
app.use(cors());


const startServer = async () => {
  await connectDB();

  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
