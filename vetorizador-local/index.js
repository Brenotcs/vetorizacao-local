const { Jimp } = require('jimp');
const ImageTracer = require('imagetracerjs');
const fs = require('fs');
const path = require('path');

const inputImage = path.join(__dirname, 'teste.png');
const outputSvg = path.join(__dirname, 'resultado.svg');

if (!fs.existsSync(inputImage)) {
    console.error('Erro: O ficheiro teste.png não foi encontrado!');
    process.exit(1);
}

async function processarVetorColorido() {
    try {
        console.log('A ler a imagem com o Jimp...');
        const image = await Jimp.read(inputImage);
        
        const width = image.bitmap.width;
        const height = image.bitmap.height;
        const data = image.bitmap.data;

        const myImageData = {
            width: width,
            height: height,
            data: data
        };

        const options = {
            numberofcolors: 16, // Reduzido para 16 para processar mais rápido e sem travar
            pathomit: 2,
            scale: 1
        };

        console.log('A analisar cores e a converter para vetor SVG...');
        
        let executou = false;

        // Executa com um mecanismo de segurança/timeout caso o callback demore
        await new Promise((resolve) => {
            ImageTracer.imagedataToSVG(myImageData, function(svgString) {
                if (!executou) {
                    executou = true;
                    fs.writeFileSync(outputSvg, svgString);
                    console.log(`Sucesso! Vetor colorido gerado em: ${outputSvg}`);
                    resolve();
                }
            }, options);

            // Timeout de segurança de 5 segundos caso a thread fique presa
            setTimeout(() => {
                if (!executou) {
                    executou = true;
                    console.log('\nAviso: O processo demorou muito no callback. A forçar encerramento...');
                    resolve();
                }
            }, 5000);
        });

        process.exit(0);

    } catch (error) {
        console.error('Erro ao processar a imagem:', error);
        process.exit(1);
    }
}

processarVetorColorido();