const apiKey = '';
const TeleBot = require('telebot');
const bot = new TeleBot(apiKey);

const fs = require('fs');
const Jimp = require("jimp");
const request = require('request');

// Dades d'imatge del tauler
const puntInicialTauler = {
	'4x4': {
		'x':29, 
		'y':203
	},
	'4x3': {
		'x':100, 
		'y':203
	}
};

const midesTauler = {
	'4x4': {
		'amplada':585, 
		'alçada':585
	},
	'4x3': {
		'amplada':440, 
		'alçada':585
	}
};

const lletres  = {'abc': ['a', 'á', 'b', 'c', 'd', 'e', 'é', 'f', 'g', 'h', 'i', 'í', 'j', 'k', 'l', 'm', 'n', 'o', 'ó', 'p', 'q', 'r', 's', 't', 'u', 'ú', 'v', 'w', 'y', 'z']};

var message;
var dadesTauler;
var files;
var columnes;
var tauler = false;
var localLletres = [];
var userLletres = [];
var finalLletres = [];
var letterFound;

bot.on(['/start', '/hello'], 
	(msg) => {
		msg.reply.text('Bienvenido al bot de Wordbrain 2! Para poder ayudarte, primero envíame los datos del tablero al que estás jugando (por ej. 4x5 o 6x6).');
		llegirLletresLocals();
	}
);

bot.on(
	'text', 
	(msg) => {
		if(msg.text.length == 3 && msg.text.indexOf("x") !== -1){
			// Es tracta de l'estructura del tauler
			tauler = true;
			dadesTauler = msg.text;
			if(puntInicialTauler[dadesTauler] == undefined){
				msg.reply.text('😖 Lo siento ' + msg.text + ' no es una medida de tablero válida, asegúrate de que estás escribiéndolo correctamente. Recuerda, tienes que entrar los datos del tablero en formato NxM (por ej. 3x4, que serian 3 filas y 4 columnas) 😖');
			} else {
				files = parseInt(msg.text.charAt('0'));
				columnes = parseInt(msg.text.charAt('2'));
				msg.reply.text('De acuerdo! El tablero al que estás jugando tiene una estructura de ' + msg.text + '. Ahora vuelve al juego y envíame una captura de pantalla para que pueda ayudarte!');
			}
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

	    Jimp.read('levels/level5_es.jpg').then(function (image2) {
	    	var threshold = 0.1;
	    	var diff = Jimp.diff(level, image2, threshold);
			console.log(diff);
			message.reply.text('Comparación de nivel hecha');
		});
	}).catch(function (err) {
	    console.log(err);
	}); */

	var ampladaLletra = parseInt(midesTauler[dadesTauler]['amplada'] / columnes);
	var alçadaLletra = parseInt(midesTauler[dadesTauler]['alçada'] / files);

	Jimp.read(photo).then(function (image) {
		for(i = 0; i<files; i++){
			for(j = 0; j<columnes; j++){
				letter = image.clone();
				console.log("Punt Inicial X = " + puntInicialTauler[dadesTauler]['x'] + (j*ampladaLletra));
				console.log("Punt Inicial Y = " + puntInicialTauler[dadesTauler]['y'] + (i*alçadaLletra));
				console.log("Amplada Lletra = " + ampladaLletra);
				console.log("Alçada Lletra = " + alçadaLletra);
				letter.crop(
					puntInicialTauler[dadesTauler]['x'] + (j*ampladaLletra),
					puntInicialTauler[dadesTauler]['y'] + (i*alçadaLletra),
					ampladaLletra,
					alçadaLletra);
				userLletres.push(letter);
			}
		}

		userLletres.forEach(function(lletraUser, indexUser){
			// lletraUser.write('lletraUser' + indexUser + '.jpg');
			// if(indexUser == 14) {
				// lletraUser.write('lletraUser' + indexUser + '.jpg');
				var minDistance = 1;
				var lletraLocalMin;
				localLletres.forEach(function(lletraLocal, indexLocal){
					// lletraLocal[0].write('lletraLocal' + indexLocal + '.jpg');
					var threshold = 0.001;
			    	var distance = Jimp.distance(lletraUser, lletraLocal[0]);

					if(distance < minDistance){
						minDistance = distance;
						lletraLocalMin = lletraLocal;
						// console.log("Lletra " + lletraLocal[1]);
						// console.log(distance);
					}
				});
				finalLletres.push(lletraLocalMin);
				console.log("Lletra trobada, la " + lletraLocalMin[1]);
				console.log(minDistance);
			// }
		});
	});
}

function llegirLletresLocals(){
	for(i = 0; i<lletres['abc'].length; i++){
		let name = lletres['abc'][i];
		let j = i;
		Jimp.read('letters/' + lletres['abc'][i] + '.jpg').then(function(image){
				// image.write(j + '.jpg');
				localLletres.push([image, name]);
		});
	}
}
