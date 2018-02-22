const TeleBot = require('telebot');
const bot = new TeleBot('459675419:AAG49yWfCK5DaCM_7PzATWl8ujWPatYg-rM');

bot.on(
	'text', 
	(msg) => msg.reply.text(msg.text)
);

bot.start();