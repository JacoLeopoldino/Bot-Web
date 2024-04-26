const TelegramBot = require('node-telegram-bot-api');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const botToken = 'digite seu token aqui para';
const bot = new TelegramBot(botToken, { polling: true });

let initialMessageSent = false;

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const messageDate = new Date(msg.date * 1000);
    const messageHour = messageDate.getHours();


    if (messageHour < 9 || messageHour >=18) {

        if (msg.text && validateEmail(msg.text)) {
            const email = msg.text;
            try {
                
                await prisma.email.create({
                    data: {
                        email: email
                    }
                });
                
                bot.sendMessage(chatId, 'Seu e-mail foi registrado com sucesso. Entraremos em contato em breve.');
            } catch (error) {
                
                bot.sendMessage(chatId, 'Ocorreu um erro ao salvar seu e-mail. Por favor, tente novamente mais tarde.');
                console.error('Erro ao salvar e-mail no banco de dados:', error);
            }
        } else {
            
            if (!initialMessageSent) {
                sendInitialMessage(chatId);
                initialMessageSent = true;
            }
        }
    } else {
 
        bot.sendMessage(chatId, 'Horário comercial! Acesse: https://faesa.br');
    }
});

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}


bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Olá! Seja bem-vindo, eu sou um BOT de atendimento. Como posso ajudá-lo?');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Você pode enviar uma mensagem a qualquer momento e eu irei ajudá-lo. Se precisar de assistência fora do horário comercial, por favor, deixe seu e-mail lhe retornarmos assim que puder.');
});

function sendInitialMessage(chatId) {
    bot.sendMessage(chatId, 'Olá, recebemos sua mensagem fora do horário comercial! O horário de funcionamento é de 09:00h às 18:00h. Por favor, deixe seu e-mail para entrarmos em contato. Caso queira deixar registrado sua mensagem digite "/help" que iremos receber');
}

