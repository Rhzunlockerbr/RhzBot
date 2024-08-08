import requests
import base64
import json
from colorama import Fore, init
from venom import Venom

init(autoreset=True)

def getStr(string, start, end):
    start_index = string.find(start)
    if start_index == -1:
        return None
    start_index += len(start)
    end_index = string.find(end, start_index)
    if end_index == -1:
        return None
    return string[start_index:end_index]

email = "vanessagenuinomag@gmail.com"
senha = "Lagegrande1*"

credentials = f"{email}:{senha}"
credentials_base64 = base64.b64encode(credentials.encode()).decode()

url_login = 'https://servicos-cloud.saude.gov.br/pni-bff/v1/autenticacao/tokenAcesso'

headers_login = {
    "Host": "servicos-cloud.saude.gov.br",
    "Connection": "keep-alive",
    "Content-Length": "0",
    "sec-ch-ua": "\"Not.A/Brand\";v=\"8\", \"Chromium\";v=\"114\", \"Google Chrome\";v=\"114\"",
    "accept": "application/json",
    "X-Authorization": f"Basic {credentials_base64}",
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
}

def login():
    response_login = requests.post(url_login, headers=headers_login)
    return response_login

def consulta_cpf(access_token, cpf):
    logins = f"https://servicos-cloud.saude.gov.br/pni-bff/v1/cidadao/cpf/{cpf}"
    jokerkkkkj = {
        "accept": "application/json, text/plain, */*",
        "authorization": f"Bearer {access_token}",
        "sec-ch-ua": "\"Not-A.Brand\";v=\"99\", \"Chromium\";v=\"124\"",
        "sec-ch-ua-mobile": "?1",
        "sec-ch-ua-platform": "\"Android\"",
        "referrer": "https://si-pni.saude.gov.br/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "mode": "cors",
        "credentials": "include"
    }
    response_calendario = requests.get(logins, headers=jokerkkkkj)
    return response_calendario

bot = Venom()

@bot.message_handler(commands=['consultacpf'])
def handle_consulta_cpf(message):
    chat_id = message.chat.id
    cpf = message.text.split(' ')[1]  # Supõe que o CPF é passado como argumento do comando
    
    response_login = login()
    fim_login = response_login.text

    if '"accessToken"' in fim_login:
        data = json.loads(fim_login)
        access_token = data.get('accessToken', '')
        response_calendario = consulta_cpf(access_token, cpf)
        
        if response_calendario.status_code == 200:
            apiminhafodase = response_calendario.json()
            apiminhafodase["criador"] = "jokerkkkkj"
            bot.send_message(chat_id, Fore.GREEN + "Resultado da consulta:\n" + json.dumps(apiminhafodase, indent=4, ensure_ascii=False))
        else:
            bot.send_message(chat_id, Fore.RED + "Falha ao obter os dados do calendário.")
    else:
        if 'Usuário e senha SCPA não autorizados' in fim_login:
            bot.send_message(chat_id, Fore.RED + "Usuário e senha SCPA não autorizados")
        else:
            bot.send_message(chat_id, Fore.RED + "Falha no login.")

    bot.send_message(chat_id, "Feito por @jokerkkkkj.")

bot.polling()
