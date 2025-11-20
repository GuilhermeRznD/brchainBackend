const express = require('express');
const router = express.Router();
const { client, getCollection, ObjectId } = require('../services/mongodb');

// Rota para buscar TODAS as notícias
router.get('/noticias', async (req, res) => {
    try {
        const noticias = await getCollection("brchainApp", "noticias");
        const todasNoticias = await noticias.find().sort({ coletadoEm: -1 }).toArray();
        res.json(todasNoticias);
    } catch (e) {
        res.status(500).send({ error: "Erro ao buscar notícias" });
    } finally {
        await client.close();
    }
});

// Rota para buscar UMA notícia pelo ID
router.get('/noticias/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const noticiaId = new ObjectId(id);
        const noticias = await getCollection("brchainApp", "noticias");
        const noticia = await noticias.findOne({ _id: noticiaId });

        if (noticia) {
            res.json(noticia);
        } else {
            res.status(404).send({ error: "Notícia não encontrada" });
        }
    } catch (e) {
        res.status(500).send({ error: "Erro ao buscar notícia" });
    } finally {
        await client.close();
    }
});

module.exports = router;