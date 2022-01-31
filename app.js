var express = require('express');
var exphbs = require('express-handlebars')

const mercadopago = require('mercadopago');
const cors = require('cors')
const bodyParser = require('body-parser')

mercadopago.configure({
    integrator_id: 'dev_24c65fb163bf11ea96500242ac130004',
    access_token: 'APP_USR-334491433003961-030821-12d7475807d694b645722c1946d5ce5a-725736327'
});

var port = process.env.PORT || 3000

var app = express();
app.use(cors())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('assets'));

app.use('/assets', express.static(__dirname + '/assets'));

app.post('/create-preference', async function (req, res) {

    try {

        let { price, img, title } = req.body
        if (!price || !img || !title) {
            return res.status(401)
        }

        img = img.replace('./', '')

        const preference = {
            items: [
                {
                    id: 1234,
                    description: 'Celular de Tienda e-commerce',
                    title,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: Number(price),
                    picture_url: req.headers.host + '/' + img,
                    category_id: 'phones'
                },
            ],
            payer: {
                name: "Lalo",
                surname: "Landa",
                email: "test_user_92801501@testuser.com",
                phone: {
                    area_code: "55",
                    number: 985298743
                },
                address: {
                    street_name: "Insurgentes Sur",
                    street_number: 1602,
                    zip_code: "78134190"
                }
            },
            external_reference: 'victoriabotelho14@gmail.com',
            back_urls: {
                success: req.headers.host + '/success',
                failure: req.headers.host + '/failure',
                pending: req.headers.host + '/pending',
            },
            auto_return: "approved",
            payment_methods: {
                excluded_payment_methods: [
                    {
                        id: "amex"
                    }
                ],
                installments: 6
            },
            notification_url: 'https://webhook.site/38ca49e9-ab65-493a-af82-996e83c600f8',
        }
        const response = await mercadopago.preferences.create(preference)
        return res.json({
            id: response.body.id
        })

    } catch (error) {
        console.log(error);
        return res.status(400)
    }

});

app.get('/', function (req, res) {
    res.render('home', { scripts: [{ script: 'https://www.mercadopago.com/v2/security.js', view: 'home' }] });
});

app.get('/detail', function (req, res) {
    res.render('detail', { ...req.query, scripts: [{ script: 'https://www.mercadopago.com/v2/security.js', view: 'item' }] });
});

app.get('/success', async function (req, res) {
    const mp = await mercadopago.payment.get(req.query.payment_id)

    res.render('success', {
        merchant_order_id: req.query.merchant_order_id,
        payment_type: req.query.payment_type,
        description: mp.body.description,
        payment_method_id: mp.body.payment_method_id,
        notification_url: mp.body.notification_url,
        transaction_amount: mp.body.transaction_amount,
        email: mp.body.payer.email,
        external_reference: req.query.external_reference,
        payment_id: req.query.payment_id,
    });
});

app.get('/failure', async function (req, res) {
    const mp = await mercadopago.payment.get(req.query.payment_id)

    res.render('failure', {
        merchant_order_id: req.query.merchant_order_id,
        payment_type: req.query.payment_type,
        description: mp.body.description,
        payment_method_id: mp.body.payment_method_id,
        notification_url: mp.body.notification_url,
        transaction_amount: mp.body.transaction_amount,
        email: mp.body.payer.email,
        external_reference: req.query.external_reference,
        payment_id: req.query.payment_id,
    });
});

app.get('/pending', async function (req, res) {
    const mp = await mercadopago.payment.get(req.query.payment_id)

    res.render('pending', {
        merchant_order_id: req.query.merchant_order_id,
        payment_type: req.query.payment_type,
        description: mp.body.description,
        payment_method_id: mp.body.payment_method_id,
        notification_url: mp.body.notification_url,
        transaction_amount: mp.body.transaction_amount,
        email: mp.body.payer.email,
        external_reference: req.query.external_reference,
        payment_id: req.query.payment_id,
    });
});

app.listen(port);