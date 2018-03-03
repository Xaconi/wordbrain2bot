// Test for image purposes

const Jimp = require("jimp");

var localLletres = [];
var userLletres = [];

var finalLocal = false;
var finalUser = false;

const lletres  = {'abc': ['a', 'á', 'b', 'c', 'd', 'e', 'é', 'f', 'g', 'h', 'i', 'í', 'j', 'k', 'l', 'm', 'n', 'o', 'ó', 'p', 'q', 'r', 's', 't', 'u', 'ú', 'v', 'w', 'y', 'z']};

for(i = 0; i < 16; i++){
	Jimp.read('lletra' + i + '.jpg').then(
		function(err, image){
			if (err) throw err;
			userLletres.push(image);
			console.log("Lletra d'usuari afegida");
	}).catch(function (err) {
	    console.error(err);
	});
}

for(i = 0; i<lletres['abc'].length; i++){
	let name = lletres['abc'][i];
	Jimp.read('letters/' + lletres['abc'][i] + '.jpg').then(
		function(image){
			localLletres.push([image, name]);
			console.log("Lletra local afegida");
	});
}

while(true){
	if(userLletres.length == 16 && localLletres.length == 30){
		userLletres.forEach(function(lletraUser, indexUser){
			lletra.write('lletraUser' + indexUser + '.jpg');
			localLletres.forEach(function(lletraLocal, indexLocal){
				lletra.write('lletraLocal' + indexLocal + '.jpg');
				var threshold = 0.001;
		    	var distance = Jimp.distance(lletraUser, lletraLocal);
		    	// image.write(j + '.jpg');
		    	// console.log(distance);
		    	// lletra.write(i + '.jpg');
				if(distance < 0.1){
					finalLletres.push(lletres['abc'][j]);
					if(finalLletres.length == 16){
						// escriureLletres();
					}
					image.write(j + '.jpg');
					console.log("Lletra trobada, porto " + finalLletres.length);
				}
			});
		});
	}
}