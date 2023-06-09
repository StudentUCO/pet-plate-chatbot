const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http');

const {createBot, createProvider, createFlow, addKeyword} = require('@bot-whatsapp/bot')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const hostname = 'localhost'
const PORT = 3030
var environment = process.env.NODE_ENV;

const app = express()
var bodyParser = require('body-parser')

app.use(cors());
app.use(bodyParser.json())
app.use(express.json())


//if(environment !== 'production'){require('longjohn')}

const flowSecundario = addKeyword(['2', 'siguiente', 'next']).addAnswer(
    ['📄 Es todo por hoy! Esperamos que disfrutes la experiencia con PetPlate.'],
    null,
    null,);


const flowThanks = addKeyword(['thanks', 'thank', 'ok', 'okay', 'okey', 'gracias']).addAnswer(
    [
        '🚀 Gracias por contactarte con nosotros, te invitamos a seguirnos en @pet_plate', '\n Escribe siguiente para terminar la conversación', '\n Escribe: *Menu* Para volver al menu principal.'
    ],
    null,
    null,
    [flowSecundario]
);

const flowCorreo = addKeyword('@').addAnswer(
    [
        '🚀 Gracias! Te contactaremos pronto.',
        'Si no recibes ningún mensaje, asegúrate de que escribiste correctamente tu correo',
        '\n Escribe: *Menu* Para volver al menu principal.'
    ],
    null,
    null,
    [flowSecundario, flowThanks]
);

const flowSub = addKeyword(['sub', 'suscribirse']).addAnswer(
    [
        '📄 Escribe el correo con el que te registraste en PetPlate.com'
    ],
    {
        capture: true,
    },
    (ctx, {fallBack}) => {
        console.log('👉 Informacion del contexto: ', ctx.body)
        console.log('👉 Telefono: ', ctx.from)
        if (!ctx.body.includes('@')) return fallBack()
    },
    [flowSecundario, flowCorreo]
);

const flowInfo = addKeyword(['info', 'informacion']).addAnswer(
    [
        '🙌 Somos un grupo de estudiantes de Ingenieria en Sistemas e Ingeniería Electrónica',
        'Inscribimos el curso de Internet of Things y ahora estamos desarrollando la aplicación PetPlate',
        '\n*PetPlate* es una aplicación de monitoreo y alarma de la alimentación de tus peluditos.',
        '\n*Menu* Para volver al menu principal.'
    ],
    null,
    null,
    [flowSecundario, flowThanks]
);


const flowWeb_Page = addKeyword(['web']).addAnswer(
    ['🤪 Accede a la página web dando click en: ', 'https://aunNoMeClickees', '\nEscribe: *Menu* Para volver al menu principal.'],
    null,
    null,
    [flowSecundario, flowThanks]
);
const flowMenu = addKeyword(['menu', 'menu principal', 'volver', 'menú', 'Menu'])
    .addAnswer(['De aquí en adelante haremos varias pruebas para obtener el chatbot deseado 🫡',
            '👉 *sub* para suscribirte a las notificaciones del alimentador de tu(s) peludito(s)',
            '👉 *info*  para conocer información acerca del PetPlate',
            '👉 *web* para recibir el link de la web_page de PetPlate',
            '👉 *menu* si te equivocas escribiendo la palabra'],
        null,
        null,
        [flowSub, flowInfo, flowThanks, flowWeb_Page]
    );

const flowPrincipal = addKeyword(['hola', 'ole', 'alo', 'oe', 'hi', 'hello'])
    .addAnswer(['Hola, bienvenido al de *Chatbot* IoT 2023', '\n Escribe *menu* para desplegar el menu principal.']
    );

const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowPrincipal, flowMenu]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    /**
     * Enviar mensaje con metodos propios del provider del bot
     */

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'bot.qr.png'));
    });

    app.post('/send_alarm', async (req, res) => {
        const waitTime = 3000;
        req.setTimeout(waitTime);
        const phone = req.body.phoneNumber;
        const petName = req.body.petName;
        const fullName = req.body.fullName;
        console.log(phone);
        console.log(petName);
        const numberID = '57' + phone + '@s.whatsapp.net';
        console.log(numberID);
        await adapterProvider.sendText(numberID, 'Oye, ' + fullName + ' se agota el alimento de tu peludito 🐕 ' + petName + '! 🥺');
        res.send({data: 'alarma enviada a ' + phone});
    })

    app.post('/send_status', async (req, res) => {
        const waitTime = 3000;
        req.setTimeout(waitTime);
        const phone = req.body.phoneNumber
        const petName = req.body.petName
        const fullName = req.body.fullName
        const peso = req.body.peso
        const status = req.body.status
        const portion = req.body.portion
        console.log(phone)
        console.log(peso)
        const numberID = '57' + phone + '@s.whatsapp.net'
        console.log(numberID)
        if (status == 'WARNING') {
            await adapterProvider.sendText(numberID, 'Hola, ' + fullName + ' tu mascota: ' + petName + ' no se alimentó correctamente, solo se le proporcionó: ' + portion + ' kg de alimento')
        }
        if (status == 'ERROR') {
            await adapterProvider.sendText(numberID, 'Hola, ' + fullName + ' tu mascota: ' + petName + ' no pudo alimentarse esta ocasión por falta de alimento')
        }
        if (status == 'OK') {
            await adapterProvider.sendText(numberID, 'Hola, ' + fullName + ' tu mascota: ' + petName + ' se alimentó correctamente')
        }
        res.send({data: 'Estado de alimentación enviado a ' + fullName + ' al número: ' + phone + ' es: ' + status})
    })

    app.post('/send_pesoA', async (req, res) => {
        const waitTime = 3000;
        req.setTimeout(waitTime);
        const phone = req.body.phoneNumber;
        const peso = req.body.peso;
        console.log(phone);
        console.log(peso);
        const numberID = '57' + phone + '@s.whatsapp.net';
        console.log(numberID);
        await adapterProvider.sendText(numberID, 'Hola, la cantidad de peso en tu alimentador es: ' + peso + ' kg 🐕');
        res.send({data: 'peso actual enviado a ' + phone});
    })
    // handle the request timeout
    app.use((err, req, res, next) => {
        console.log('Error en peticion');
        if (err && err.code === 'ECONNABORTED') {
            // handle timeout error
            throw new Error('Request timed out');
        }
        next();
    });

    app.listen(PORT, hostname, function () {
        console.log(`http://${hostname}:${PORT}`)
    })
}

main()
