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

// noticias aprovadas para o ususario
app.get("/api/noticias", async (req, res) => {
    const noticias = await Noticia.find({ status: "aprovada" });
    res.json(noticias);
});
// noticias pendentes para o admin
app.get("/admin/noticias/pendentes", async (req, res) => {
    const noticias = await Noticia.find({ status: "pendente" });
    res.json(noticias);
});
// noticias rejeitadas
app.post("/admin/noticias/:id/rejeitar", async (req, res) => {
    await Noticia.findByIdAndUpdate(req.params.id, { status: "rejeitada" });
    res.json({ sucesso: true });
});
// noticias aprovadas
app.post("/admin/noticias/:id/aprovar", async (req, res) => {
    await Noticia.findByIdAndUpdate(req.params.id, { status: "aprovada" });
    res.json({ sucesso: true });
});

