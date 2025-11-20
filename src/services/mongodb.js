const { MongoClient, ObjectId } = require('mongodb');
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function getCollection(dbName, collectionName) {
    let db;
    try {
        await client.connect();
        db = client.db(dbName);
        return db.collection(collectionName);
    } catch (error) {
        console.error("Erro ao conectar ao MongoDB:", error);
        throw error;
    }
}

module.exports = {
    client,
    getCollection,
    ObjectId
};