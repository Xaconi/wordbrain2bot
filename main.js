const apiKey = '';
const TeleBot = require('telebot');
const bot = new TeleBot(apiKey);

bot.on(
	'text', 
	(msg) => msg.reply.text(msg.text)
);

bot.on(
	'photo', 
	(msg) => {
		// msg.reply.photo('https://api.telegram.org/file/bot' + apiKey + '/' + msg.photo[0].file_path);
		console.log(msg.photo);
		msg.reply.photo('http://thecatapi.com/api/images/get');
	}
);

bot.start();