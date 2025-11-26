const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const { getCollection, client } = require('../services/mongodb');

router.get('/todas', async (req, res) => {
    try {
        const noticias = await getCollection("brchainApp", "noticias");
        const lista = await noticias.find({}).sort({ coletadoEm: -1 }).toArray();
        res.json(lista);
    } catch (e) {
        res.status(500).json({ error: "Erro ao buscar notícias." });
    } finally {
        await client.close();
    }
});

router.post('/adicionar', async (req, res) => {
    try {
        const novaNoticia = {
            ...req.body, 
            coletadoEm: new Date(),
            source: 'App Admin',
            type: 'Notícia', 
            status: 'approved' 
        };

        const noticias = await getCollection("brchainApp", "noticias");
        await noticias.insertOne(novaNoticia);
        
        res.status(201).json({ message: "Notícia criada com sucesso!" });
    } catch (e) {
        res.status(500).json({ error: "Erro ao criar notícia." });
    } finally {
        await client.close();
    }
});

router.put('/editar/:id', async (req, res) => {
    const { id } = req.params;
    const dados = req.body; 

    try {
        const noticias = await getCollection("brchainApp", "noticias");
        delete dados._id; 

        await noticias.updateOne(
            { _id: new ObjectId(id) },
            { $set: dados }
        );
        
        res.json({ message: "Notícia atualizada com sucesso!" });
    } catch (e) {
        res.status(500).json({ error: "Erro ao atualizar notícia." });
    } finally {
        await client.close();
    }
});

router.delete('/remover/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const noticias = await getCollection("brchainApp", "noticias");
        await noticias.deleteOne({ _id: new ObjectId(id) });
        
        res.json({ message: "Notícia removida com sucesso." });
    } catch (e) {
        res.status(500).json({ error: "Erro ao remover notícia." });
    } finally {
        await client.close();
    }
});

module.exports = router;