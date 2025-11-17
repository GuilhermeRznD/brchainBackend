require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(cors()); 
const port = 3000;
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

// Rota para buscar TODAS as notícias
app.get('/api/noticias', async (req, res) => {
  try {
    await client.connect();
    const database = client.db("brchainApp");
    const noticias = database.collection("noticias");
    
    const todasNoticias = await noticias.find().sort({ coletadoEm: -1 }).toArray();
    res.json(todasNoticias);
    
  } catch (e) {
    res.status(500).send({ error: "Erro ao buscar notícias" });
  } finally {
    await client.close(); 
  }
});

app.get('/api/noticias/:id', async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID da URL

    await client.connect();
    const database = client.db("brchainApp");
    const noticias = database.collection("noticias");

    // Busca UMA notícia pelo '_id' do MongoDB
    const noticia = await noticias.findOne({ _id: new ObjectId(id) });
    
    if (noticia) {
      res.json(noticia); 
    } else {
      res.status(404).send({ error: "Notícia não encontrada" });
    }
  } catch (e) {
    console.error(e); 
    res.status(500).send({ error: "Erro ao buscar notícia" });
  } finally {
    await client.close();
  }
});


app.listen(port, () => {
  console.log(`API rodando em http://localhost:${port}`);
});