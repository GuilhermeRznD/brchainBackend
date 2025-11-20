# BRChain - Backend (Scraper & API)

Este projeto contém o back-end para o aplicativo BRChain. Ele é dividido em duas partes:

1.  **`scraping.js` (O Coletor):** Um script Node.js que usa o Puppeteer para fazer web scraping do site do Ministério da Saúde (`gov.br/saude`), extrair as notícias mais recentes e salvá-las em um banco de dados MongoDB Atlas.
2.  **`api.js` (A Ponte):** Um servidor Node.js/Express que lê o banco de dados MongoDB e "serve" as notícias em formato JSON para o aplicativo React Native consumir.

## Tecnologias Utilizadas

* **Node.js**
* **Puppeteer:** Para o web scraping (controla um navegador Chrome).
* **MongoDB (Atlas):** Como banco de dados NoSQL na nuvem.
* **Express:** Para criar o servidor da API.
* **CORS:** Para permitir que o app React Native acesse a API.
* **Dotenv:** Para gerenciamento de chaves de API.

## Como Executar (Ambiente de Desenvolvimento)

### 1. Pré-requisitos

* [Node.js](https://nodejs.org/en/) (v18 ou superior)
* Uma conta gratuita no [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).

### 2. Configuração

1.  Clone este repositório:
    ```bash
    git clone https://github.com/GuilhermeRznD/brchainBackend
    cd brchainBackend
    ```

2.  Instale as dependências:
    ```bash
    npm install
    ```

3.  Configure seu Banco de Dados (MongoDB Atlas):
    * Crie um cluster M0 (gratuito).
    * Crie um usuário e senha para o banco (ex: `user: brchain`, `pass: 123456`).
    * Em "Network Access", autorize o acesso de qualquer IP (`0.0.0.0/0`).
    * Clique em "Connect" > "Drivers" e pegue sua **String de Conexão**.

4.  Crie o arquivo de ambiente:
    * Na raiz do projeto, crie um arquivo chamado `.env`
    * Dentro dele, cole sua string de conexão, que seria algo como abaixo:
        ```
        MONGO_URI="mongodb+srv://brchain:<password>@cluster0.wfnbb83.mongodb.net/?appName=Cluster0"
        ```

### 3. Executando o Projeto
Para rodar o script de scraping na raiz do projeto digite:
 ```bash
    node scraping.js
 ```
Em seguida para rodar a API digite>

 ```bash
    node api.js
 ```
