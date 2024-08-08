const axios = require('axios');
const base64 = require('base-64');
const venom = require('venom-bot');

const email = "vanessagenuinomag@gmail.com";
const senha = "Lagegrande1*";

const credentials = `${email}:${senha}`;
const credentials_base64 = base64.encode(credentials);

const url_login = 'https://servicos-cloud.saude.gov.br/pni-bff/v1/autenticacao/tokenAcesso';

const headers_login = {
    "Host": "servicos-cloud.saude.gov.br",
    "Connection": "keep-alive",
    "Content-Length": "0",
    "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
    "accept": "application/json",
    "X-Authorization": `Basic ${credentials_base64}`,
    "sec-ch-ua-mobile": "?0",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "sec-ch-ua-platform": "Windows",
    "Origin": "https://si-pni.saude.gov.br",
    "Sec-Fetch-Site": "same-site",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    "Referer": "https://si-pni.saude.gov.br/",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
};

async function login() {
    try {
        const response = await axios.post(url_login, {}, { headers: headers_login });
        return response.data;
    } catch (error) {
        console.error('Error during login:', error.response ? error.response.data : error.message);
        return null;
    }
}

async function consulta_cpf(accessToken, cpf) {
    const url_consulta = `https://servicos-cloud.saude.gov.br/pni-bff/v1/cidadao/cpf/${cpf}`;
    const headers_consulta = {
        "accept": "application/json, text/plain, */*",
        "authorization": `Bearer ${accessToken}`,
        "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "referrer": "https://si-pni.saude.gov.br/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "mode": "cors",
        "credentials": "include"
    };

    try {
        const response = await axios.get(url_consulta, { headers: headers_consulta });
        return response.data;
    } catch (error) {
        console.error('Error during CPF consultation:', error.response ? error.response.data : error.message);
        return null;
    }
}

venom.create({
    headless: true, // Modo headless
    browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'], // Argumentos adicionais do navegador
    executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe' // Caminho para o executável do Chrome
}).then((client) => {
    client.onMessage(async (message) => {
        if (message.body.startsWith('/consultacpf')) {
            const cpf = message.body.split(' ')[1];
            const loginData = await login();
            if (loginData && loginData.accessToken) {
                const consultaData = await consulta_cpf(loginData.accessToken, cpf);
                if (consultaData) {
                    consultaData.criador = "jokerkkkkj";
                    await client.sendText(message.from, `Resultado da consulta:\n${JSON.stringify(consultaData, null, 4)}`);
                } else {
                    await client.sendText(message.from, 'Falha ao obter os dados do calendário.');
                }
            } else {
                await client.sendText(message.from, 'Falha no login.');
            }
        }
    });
}).catch((error) => {
    console.error(error);
});
