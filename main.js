const apiKey = '';
const TeleBot = require('telebot');
const bot = new TeleBot(apiKey);

const fs = require('fs');
const Jimp = require("jimp");
const request = require('request');

bot.on(
	'text', 
	(msg) => msg.reply.text(msg.text)
);

bot.on(
	'photo', 
	(msg) => {
		// Aconseguim la foto en bona qualitat
		getRealPhoto(msg.photo[3], function(photo) {
			photoEdition(photo);
			msg.reply.photo('test.jpg');
			// fs.unlink('test.jpg');
		});
	}
);

bot.start();

// Funcions

function photoEdition(photo){
	Jimp.read('https://api.telegram.org/file/bot' + apiKey + '/' + photo.file_path, function(err, image) {
		if(err) throw err;
		image.resize(256, 256)
			.write("test.jpg");
	});
}

function getRealPhoto(photo, callback){
	var url = 'https://api.telegram.org/bot' + apiKey + '/getFile?file_id=' + photo.file_id;
	var realPhoto = '';
	request.get({
		url: url,
		json: true,
		headers: {'User-Agent': 'request'}
	}, (err, res, data) => {
		if (err) {
	    	console.log('Error:', err);
	    } else if (res.statusCode !== 200) {
	    	console.log('Status:', res.statusCode);
	    } else {
	    	// data is already parsed as JSON:
	    	realPhoto = data.result;
	    	callback(realPhoto);
	    }
	});
}
