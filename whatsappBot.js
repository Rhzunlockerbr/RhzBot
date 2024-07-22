const venom = require('venom-bot');
const axios = require('axios');
const path = require('path');

venom.create({
  session: 'my-session', // Nome da sessão
  folderNameToken: path.join(__dirname, 'sessions'), // Caminho para armazenar a sessão
}).then((client) => start(client));

function start(client) {
  console.log('Bot iniciado com sucesso!'); // Log para confirmar que o bot foi iniciado

  client.onMessage(async (message) => {
    console.log('Mensagem recebida:', message); // Log para mostrar a mensagem recebida

    if (message.isGroupMsg && message.body.startsWith('/check')) {
      const params = message.body.split(' ');
      const imei = params[1] ? params[1].trim() : null;
      const serial = params[2] ? params[2].trim() : null;

      if (imei || serial) {
        // Mensagem de confirmação
        client.sendText(message.from, '🔍 Sua consulta está sendo processada. Aguarde um momento enquanto buscamos as informações...');

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
          // Enviar dados usando URLSearchParams
          const response = await axios.post('https://api.ifreeicloud.co.uk', new URLSearchParams(myCheck).toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
          });

          console.log('Status Code:', response.status);
          console.log('Resposta Completa:', response.data);

          const myResult = response.data;

          if (myResult.success === undefined) {
            client.sendText(message.from, '❌ Erro: Resposta inesperada da API.');
            return;
          }

          if (!myResult.success) {
            client.sendText(message.from, `❌ Erro: ${myResult.response || 'Erro desconhecido'}`);
          } else {
            const object = myResult.object;

            let reply = '*✅ CHECK NEW SUPPORT ✅*\n';
            reply += `📱 *Descrição do Modelo:* ${object.modelDescription}\n`;
            reply += `📱 *Modelo:* ${object.model}\n`;
            reply += '====================\n';
            if (object.imei) reply += `🔍 *IMEI:* ${object.imei}\n`;
            if (object.serial) reply += `🔢 *Número de Série:* ${object.serial}\n`;
            reply += `🛠️ *Status da Garantia:* ${object.warrantyStatus}\n`;
            reply += `📅 *Data Estimada de Compra:* ${object.estimatedPurchaseDate}\n`;
            reply += `🔒 *Find My iPhone:* ${object.fmiON ? 'ON ✅' : 'OFF ✅'}\n`;
            reply += `🔒 *Status do iCloud:* ${object.fmiON ? (object.lostMode ? 'Perdido 🔴' : 'Limpo ✅') : 'N/A'}\n`;
            reply += `📋 *Unidade de Demonstração:* ${object.demoUnit}\n`;
            reply += `📋 *Dispositivo de Empréstimo:* ${object.loanerDevice}\n`;
            reply += `🔄 *Dispositivo Substituído:* ${object.replacedDevice}\n`;
            reply += `🔄 *Dispositivo de Substituição:* ${object.replacementDevice}\n`;
            reply += `🛠️ *Dispositivo Reformado:* ${object.refurbishedDevice}\n`;
            reply += `🔗 *Status na Lista Negra:* ${object.blacklistStatus}\n`;
            reply += `🌍 *País de Compra:* ${object.purchaseCountry}\n`;
            reply += `📶 *Operadora Possível:* ${object.possibleCarrier}\n`;
            reply += `📶 *Operadora:* ${object.carrier}\n`;
            reply += `🔓 *Status de Bloqueio SIM:* ${object['sim-lockStatus']}\n`;
            reply += '====================\n';
            reply += '*✅ CHECK NEW SUPPORT ✅*\n';
            reply += '*Criador do Bot:* RhzUnlocker\n';
            reply += '*Número de Contato:* +55 21 96874-1898\n';

            client.sendText(message.from, reply);
          }
        } catch (error) {
          console.error('Erro na solicitação:', error.message);
          client.sendText(message.from, `❌ Erro HTTP: ${error.response ? error.response.status : 'Desconhecido'}\nMensagem: ${error.message}`);
        }
      } else {
        client.sendText(message.from, '⚠️ Por favor, forneça um IMEI ou número de série válido.');
      }
    }
  });
}
