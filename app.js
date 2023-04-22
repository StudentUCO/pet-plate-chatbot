const express = require('express')
const http = require('http')
const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')

const hostname = '10.209.23.135'
var environment = process.env.NODE_ENV;
const app = express()
var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(express.json())


if(environment !== 'production'){require('longjohn')}

const flowSecundario = addKeyword(['2', 'siguiente','next']).addAnswer(
    ['📄 That is all for today! Feel free to contact us wherever you need.'], 
    null, 
    null, )


const flowThanks = addKeyword(['thanks', 'thank', 'ok', 'okay', 'okey', 'gracias']).addAnswer(
    [
        '🚀 Thank u for talk with us, keep in touch following us as @pet_plate', 'Write next to end the conversation', , '\n*inicio* Para volver al menu principal.'
    ],
    null,
    null,
    [flowSecundario]
)

const flowCorreo = addKeyword('@').addAnswer(
    [
        '🚀 Thank you! we will send you a e-mail soon.',
        'If you did not receive any message make sure you write correctly your e-mail',
        '\n*inicio* Para volver al menu principal.'
    ],
    null,
    null,
    [flowSecundario,flowThanks]
)

const flowSub = addKeyword(['sub', 'suscribirse']).addAnswer(
    [
        '📄 Please write the e-mail which you registered yourself in PetPlate.com'
    ],
    {
        capture: true,
    },
    (ctx, { fallBack }) => {
        console.log('👉 Informacion del contexto: ', ctx.body)
        console.log('👉 Telefono: ', ctx.from)
        if (!ctx.body.includes('@')) return fallBack()},    
    [flowSecundario, flowCorreo]
)

const flowInfo = addKeyword(['info', 'informacion']).addAnswer(
    [
        '🙌 Somos un grupo de estudiantes de Ingenieria en Sistemas e Ingeniería Electrónica',
        'Inscribimos el curso de Internet of Things y ahora estamos desarrollando la aplicación PetPlate',
        '\n*PetPlate* es una aplicación de monitoreo y alarma de la alimentación de tus peluditos.',
         '\n*inicio* Para volver al menu principal.'
    ],
    null,
    null,
    [flowSecundario, flowThanks]
)


const flowWeb_Page = addKeyword(['web']).addAnswer(
    ['🤪 Accede a la página web dando click en: ', 'https://aunNoMeClickees', '\n*inicio* Para volver al menu principal.'],
    null,
    null,
    [flowSecundario, flowThanks]
)
const flowMenu = addKeyword(['menu', 'menu principal', 'inicio'])
    .addAnswer( ['De aquí en adelante haremos varias pruebas para obtener el chatbot deseado 🫡',
                '👉 *sub* para suscribirte a las notificaciones del alimentador de tu(s) peludito(s)',
                '👉 *info*  para conocer información acerca del PetPlate',
                '👉 *web* para recibir el link de la web_page de PetPlate'],
        null,
        null,
        [flowSub, flowInfo, flowThanks, flowWeb_Page]
    )

const flowPrincipal = addKeyword(['hola', 'ole', 'alo', 'oe', 'hi', 'hello'])
    .addAnswer(['Hola, bienvenido al de *Chatbot* IoT 2023', '\n Escribe *menú* para desplegar el menu principal.'],
        null,
        null,
        [flowMenu]
    )

const main = async () => {
    const adapterDB = new MockAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    /**
     * Enviar mensaje con metodos propios del provider del bot
     */
    
    app.post('/send_alarm', async (req, res) => {
        const phone = req.body.phone
        const feeder = req.body.feeder
        console.log(phone)
        console.log(feeder)
        const numberID = '57' + phone + '@s.whatsapp.net'
        console.log(numberID)
        await adapterProvider.sendText(numberID, 'Oye, se agota el alimento de tu peludito 🐕 en el alimentador ' + feeder +'! 🥺')
        res.send({ data: 'alarma enviada a ' + phone})
    })
    app.post('/send_pesoA', async (req, res) => {
        const phone = req.body.phone
        const peso = req.body.peso
        console.log(phone)
        console.log(peso)
        const numberID = '57' + phone + '@s.whatsapp.net'
        console.log(numberID)
        await adapterProvider.sendText(numberID, 'Hola, la cantidad de peso en tu alimentador es: ' + peso + ' kg 🐕')
        res.send({ data: 'peso actual enviado a ' + phone})
    })

    const PORT = 3030
    app.listen(PORT, hostname, function(){ console.log(`http://${hostname}:${PORT}`)})
}

main()
