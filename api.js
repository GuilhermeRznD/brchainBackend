require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); 
const app = express();
const dataRoutes = require('./src/routes/data');
const authRoutes = require('./src/routes/auth');
const port = process.env.PORT || 3000;


// --- Middlewares ---
app.use(cors());
app.use(bodyParser.json()); 

// --- Linkando as Rotas ---
app.use('/api', dataRoutes); 
app.use('/api/auth', authRoutes); 

// Rota de teste
app.get('/', (req, res) => {
    res.send('BRChain Backend API está rodando.');
});

app.listen(port, () => {
    console.log(`API rodando em http://localhost:${port}`);
});