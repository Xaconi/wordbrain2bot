const apiKey = '';
const TeleBot = require('telebot');
const bot = new TeleBot(apiKey);

const fs = require('fs');
const Jimp = require("jimp");
const request = require('request');

var message;
var dadesTauler;
var files;
var columnes;
var tauler = false;

// Dades d'imatge del tauler
var puntInicialTauler = {'x':29, 'y':203};
var midesTauler = {'amplada':585, 'alçada':585};

bot.on(['/start', '/hello'], 
	(msg) => {
		msg.reply.text('Bienvenido al bot de Wordbrain 2! Para poder ayudarte, primero envíame los datos del tablero al que estás jugando (por ej. 4x5 o 6x6).');
	}
);

bot.on(
	'text', 
	(msg) => {
		if(msg.text.length == 3 && msg.text.indexOf("x") !== -1){
			// Es tracta de l'estructura del tauler
			tauler = true;
			dadesTauler = msg.text;
			files = parseInt(msg.text.charAt('0'));
			columnes = parseInt(msg.text.charAt('2'));
			msg.reply.text('De acuerdo! El tablero al que estás jugando tiene una estructura de ' + msg.text + '. Ahora vuelve al juego y envíame una captura de pantalla para que pueda ayudarte!');
		} else if(msg.text != '/start' && msg.text != '/hello'){
			msg.reply.text('Lo siento, no reconozco la estructura. ¿Puedes volverlo a intentar?');
		}
	}
);

bot.on(
	'photo', 
	(msg) => {
		if(tauler){
			msg.reply.text('👌 Perfecto! Déjame un momento que me lo mire y enseguida te respondo todas las soluciones posibles.');
			// Aconseguim la foto en bona qualitat
			getRealPhoto(msg.photo[3], function(photo) {
				photoEdition(photo, function() {
					// msg.reply.photo('test.jpg');
					getLetters('test.jpg');
				});
			});
		} else {
			msg.reply.text('Lo siento, primero tienes que pasarme la estructura del tablero en formato NxM (por ej. 4x5 o 6x6).');
		}
	}
);

bot.start();

// Funcions

function photoEdition(photo, callback){
	Jimp.read('https://api.telegram.org/file/bot' + apiKey + '/' + photo.file_path, function(err, image) {
		if(err) throw err;
		image.resize(640, 1136).write("test.jpg", function() {
			callback();
		});
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

function getLetters(photo){
	// TODO: Primer mirem de quin tauler estem parlant
	// i establim les mides de les lletres

	// Mirem a quin nivell esta
	/*Jimp.read(photo).then(function (image) {
	    level = image.crop(276, 59, 173, 25);

	    Jimp.read('levels/level5_es.png').then(function (image2) {
	    	var threshold = 0.1;
	    	var diff = Jimp.diff(level, image2, threshold);
			console.log(diff);
			message.reply.text('Comparación de nivel hecha');
		});
	}).catch(function (err) {
	    console.log(err);
	}); */

	var ampladaLletra = parseInt(midesTauler['amplada'] / columnes);
	var alçadaLletra = parseInt(midesTauler['alçada'] / files);

	Jimp.read(photo).then(function (image) {
		for(i = 0; i<files; i++){
			for(j = 0; j<columnes; j++){
				letter = image.clone();
				console.log("Punt Inicial X = " + puntInicialTauler['x'] + (j*ampladaLletra));
				console.log("Punt Inicial Y = " + puntInicialTauler['y'] + (i*alçadaLletra));
				console.log("Amplada Lletra = " + ampladaLletra);
				console.log("Alçada Lletra = " + alçadaLletra);
				letter.crop(
					puntInicialTauler['x'] + (j*ampladaLletra),
					puntInicialTauler['y'] + (i*alçadaLletra),
					ampladaLletra,
					alçadaLletra);
				letter.write(i + ' ' + j + '.png');
			}
		}
	});
}
