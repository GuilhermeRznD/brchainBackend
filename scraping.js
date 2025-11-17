require('dotenv').config();
const pup = require('puppeteer');
const { MongoClient } = require('mongodb');

const url = 'https://www.gov.br/saude/pt-br/assuntos/noticias';
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    console.log("Conectado ao MongoDB Atlas!");
    
    const database = client.db("brchainApp");
    const noticias = database.collection("noticias");

    const browser = await pup.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForNetworkIdle();

    const links = await page.$$eval('.tileHeadline > a', el => el.map(link => link.href));
    
    for (const link of links) {
        await page.goto(link);

        const titulo = await page.$eval('.documentFirstHeading', el => el.innerText);
        const data = await page.$eval('.documentPublished > span.value', el => el.innerText);
        
        let imagemUrl = null;
        try {
          const imagens = await page.$$eval('#media > img', el => el.map(img => img.src));
          if (imagens.length > 0) {
            imagemUrl = imagens[0];
          }
        } catch (error) {
          console.log(`Sem imagem para: ${titulo}`);
        }

        // NOVO: Capturar o corpo do texto 
        let body = null;
        try {
          // 'innerText' para pegar o texto puro, sem o HTML
          body = await page.$eval('#parent-fieldname-text', el => el.innerText);
        } catch (error) {
          console.log(`Sem corpo de texto para: ${titulo}`);
        }
        const objeto = {
            titulo: titulo,
            data: data,
            url: link,
            imagem: imagemUrl,
            body: body, 
            coletadoEm: new Date(),
            source: 'Gov.br',
            type: 'Notícia'
        };

        await noticias.updateOne(
          { url: objeto.url },
          { $set: objeto },
          { upsert: true }
        );
        
        console.log("Salvo:", objeto.titulo);
    }

    await browser.close();
    
  } finally {
    await client.close();
    console.log("Desconectado do MongoDB.");
  }
}

run().catch(console.dir);