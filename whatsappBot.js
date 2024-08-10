const venom = require('venom-bot');
const axios = require('axios');
const path = require('path');
const express = require('express');

const app = express();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

venom.create({
  session: 'my-session', // Nome da sessão
  folderNameToken: path.join(__dirname, 'sessions'), // Caminho para armazenar a sessão
  headless: 'new', // Atualizado para 'new' ou 'false' para evitar depreciação
  qrTimeout: 0, // Tempo infinito para exibir o QR code
  authTimeout: 60, // Tempo limite para autenticação (em segundos)
  autoClose: 0, // Não fechar a sessão automaticamente
  catchQR: (qrCode, asciiQR) => {
    console.log('Por favor, escaneie o QR code abaixo para autenticar:');
    console.log(asciiQR); // Exibe o QR code em ASCII no terminal
  }
}).then((client) => start(client));

function start(client) {
  console.log('Bot iniciado com sucesso!');

  client.onMessage(async (message) => {
    console.log('Mensagem recebida:', message);

    if (message.isGroupMsg && message.body.startsWith('/check')) {
      const params = message.body.split(' ');
      const imei = params[1] ? params[1].trim() : null;
      const serial = params[2] ? params[2].trim() : null;

      if (imei || serial) {
        client.sendText(message.from, '🔍 *Sua consulta está sendo processada.*\nPor favor, aguarde um momento enquanto buscamos as informações...');

        const myCheck = {
          service: 120,
          key: 'H1M-ZI2-XLO-5AB-4PF-UDR-R84-TT9'
        };

        if (imei) {
          myCheck.imei = imei;
        }

        if (serial) {
          myCheck.serial = serial;
        }

        try {
          const response = await axios.post('https://api.ifreeicloud.co.uk', new URLSearchParams(myCheck).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });

          console.log('Status Code:', response.status);
          console.log('Resposta Completa:', response.data);

          const myResult = response.data;

          if (myResult.success === undefined) {
            client.sendText(message.from, '❌ *Erro:* Resposta inesperada da API.');
            return;
          }

          if (!myResult.success) {
            client.sendText(message.from, `❌ *Erro:* ${myResult.response || 'Erro desconhecido'}`);
          } else {
            const object = myResult.object;

            let reply = '✅ *NEW SUPPORT CHECK* ✅\n';
            reply += '--------------------------\n';
            reply += `📱 *Model Description:* ${object.modelDescription}\n`;
            reply += `📱 *Model:* ${object.model}\n`;
            reply += '--------------------------\n';
            if (object.imei) reply += `🔍 *IMEI:* ${object.imei}\n`;
            if (object.serial) reply += `🔢 *Serial Number:* ${object.serial}\n`;
            reply += `🛠️ *Warranty Status:* ${object.warrantyStatus}\n`;
            reply += `📅 *Estimated Purchase Date:* ${object.estimatedPurchaseDate}\n`;
            reply += `🔒 *Find My iPhone:* ${object.fmiON ? 'ON ✅' : 'OFF ✅'}\n`;
            reply += `🔒 *iCloud Status:* ${object.fmiON ? (object.lostMode ? 'Lost 🔴' : 'Clean ✅') : 'N/A'}\n`;
            reply += `📋 *Demo Unit:* ${object.demoUnit}\n`;
            reply += `📋 *Loaner Device:* ${object.loanerDevice}\n`;
            reply += `🔄 *Replaced Device:* ${object.replacedDevice}\n`;
            reply += `🔄 *Replacement Device:* ${object.replacementDevice}\n`;
            reply += `🛠️ *Refurbished Device:* ${object.refurbishedDevice}\n`;
            reply += `🔗 *Blacklist Status:* ${object.blacklistStatus}\n`;
            reply += `🌍 *Purchase Country:* ${object.purchaseCountry}\n`;
            reply += `📶 *Possible Carrier:* ${object.possibleCarrier}\n`;
            reply += `📶 *Carrier:* ${object.carrier}\n`;
            reply += `🔓 *SIM Lock Status:* ${object['sim-lockStatus']}\n`;
            reply += '--------------------------\n';
            reply += '*Bot Creator:* RhzUnlocker\n';
            reply += '*Contact Number:* +55 21 96874-1898\n';

            client.sendText(message.from, reply);
          }
        } catch (error) {
          console.error('Request error:', error.message);
          client.sendText(message.from, `❌ *HTTP Error:* ${error.response ? error.response.status : 'Unknown'}\n*Message:* ${error.message}`);
        }
      } else {
        client.sendText(message.from, '⚠️ *Por favor, forneça um IMEI ou número de série válido.*');
      }
    } else if (message.isGroupMsg && message.body.startsWith('/status')) {
      const params = message.body.split(' ');
      const imei = params[1] ? params[1].trim() : null;

      if (imei) {
        client.sendText(message.from, '🔍 *Sua consulta de status está sendo processada.*\nPor favor, aguarde um momento...');

        const myCheck = {
          service: 60,
          imei: imei,
          key: 'H1M-ZI2-XLO-5AB-4PF-UDR-R84-TT9'
        };

        try {
          const response = await axios.post('https://api.ifreeicloud.co.uk', new URLSearchParams(myCheck).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });

          console.log('Status Code:', response.status);
          console.log('Resposta Completa:', response.data);

          const myResult = response.data;

          if (myResult.success === undefined) {
            client.sendText(message.from, '❌ *Erro:* Resposta inesperada da API.');
            return;
          }

          if (!myResult.success) {
            client.sendText(message.from, `❌ *Erro:* ${myResult.error || 'Erro desconhecido'}`);
          } else {
            const object = myResult.object;

            let statusMessage = "✅ *NEW SUPPORT CHECK* ✅\n";
            statusMessage += '--------------------------\n';
            statusMessage += `📱 *Model:* ${object.model}\n`;
            statusMessage += `🔒 *Find My iPhone:* ${object.fmiON ? 'ON ✅' : 'OFF ✅'}\n`;
            statusMessage += `🔒 *Status:* ${object.fmiON ? (object.lostMode ? 'Lost 🔴' : 'Clean ✅') : 'N/A'}\n`;
            statusMessage += '--------------------------\n';

            client.sendText(message.from, statusMessage);
          }
        } catch (error) {
          console.error('Request error:', error.message);
          client.sendText(message.from, `❌ *HTTP Error:* ${error.response ? error.response.status : 'Unknown'}\n*Message:* ${error.message}`);
        }
      } else {
        client.sendText(message.from, '⚠️ *Por favor, forneça um IMEI válido.*');
      }
    }
  });
}
