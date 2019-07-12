const express = require('express')
const mongoose = require('mongoose')
const Schema = mongoose.Schema
const app = express()
const jsonParser = express.json()
const path = require('path')
const ObjectID = require('mongodb').ObjectID
mongoose.set('useFindAndModify', false);

const userSchema = new Schema({
    userid: Number,
    balance: {
        type: Number,
        default: 0,
        min: 0
    }
})

const shopSchema = new Schema({
    link: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    balance: {
        type: Number,
        default: 0,
        min: 0
    },
    goods: [{ type: String }],
    price: Number
})

const User = mongoose.model("User", userSchema)
const Shop = mongoose.model("Shop", shopSchema)

const transactionSchema = new Schema({
    _user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    _shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    created: Date,
    sumTransaction: Number
})

const confirmationSchema = new Schema({
    _user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    _shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    code: String,
    status: Number
})

const Transaction = mongoose.model("Transaction", transactionSchema)
const Confirmation = mongoose.model("Confirmation", confirmationSchema)

let shop1 = new Shop({
    link: 'https://rozetka.com',
    name: 'Rozetka',
    balance: 1000,
    goods: ['laptop', 'phone', 'tablet'],
    price: 400
})
let shop2 = new Shop({
    link: 'https://citrus.com',
    name: 'Citrus',
    balance: 0,
    goods: ['ebook', 'headphones'],
    price: 350
})
let shop3 = new Shop({
    link: 'https://atb.com',
    name: 'ATB',
    balance: 200,
    goods: ['water', 'milk', 'beer'],
    price: 100
})
let user1 = new User({
    balance: 350
})
user1.save()

app.set('view engine', 'pug')
app.use(express.static(__dirname + "public"));

mongoose.connect('mongodb://localhost:27017/onlineShop', { useNewUrlParser: true }, function (err) {
    if (err) return console.log(err)
    app.listen(3000, function () {
        console.log("Server is runing..")
    })
})

async function getLastCreatedUser() {
    return User.findOne({}, function (err, user) {
        if (err) return console.log(err)
        return user
    })
}
function generateString() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < characters.length; i++) {
        result += characters.charAt(Math.floor(Math.random() * 6));
    }
    return result;
}

app.get('/api/shops', function (req, res) {
    Shop.find({}, function (err, shops) {
        if (err) return console.log(err)
        if (shops.length < 3) {
            Shop.insertMany([shop1, shop2, shop3], function (err) {
                if (err) return console.log(err)
            })
        }
        res.render('index', { title: 'Hey', shops: shops })
    })
    // Confirmation.deleteMany({}, function(err, shops){
    //     res.send(shops)
    // })
})

app.get('/api/shops/:id', jsonParser, function (req, res) {
    Shop.findOne({ _id: req.params.id }, function (err, shop) {
        if (err) return console.log(err)
        async function renderShopByUser() {
            let user = await getLastCreatedUser()
            res.render('shop', { shop: shop, user: user })
        }
        renderShopByUser()
    })
})

app.post('/api/shops/:id/transaction', jsonParser, function (req, res) {
    User.findOne({}, function (err, user) {
        if (err) return console.log(err)
        if (user.balance < 200) {
            return console.log('Not enougth money!', user.balance)
        } else {
            let newTransaction = new Transaction({
                _user: user._id,
                _shop: req.params.id,
                created: req.params.created,
                sumTransaction: 200
            })
            let newConfirmation = new Confirmation({
                _user: user._id,
                _shop: req.params.id,
                code: generateString(),
                status: 0
            })
            newTransaction.save()
            newConfirmation.save()
        }
    })
})

app.get('/api/shops/:id/transaction', jsonParser, function (req, res) {
    Confirmation.findOne({ _shop: req.params.id }, function (err, confirmation) {
        if (err) return console.log(err)
        res.render('transaction', {
            code: confirmation.code,
            user: confirmation._user,
            shop: confirmation._shop
        })
    })
})


app.put('/api/shops/:id/transaction/:code', jsonParser, function (req, res) {
    Confirmation.findOne({ code: req.params.code }, function (err, confirmation) {
        if (err) return console.log(err)
        User.findOneAndUpdate({ _id: confirmation._user },
            { $inc: { balance: -200 } },
            { new: true },
            function (err, user) {
                if (err) return console.log(err)
                console.log('\n user: ' + user)
            })
        Transaction.findOneAndUpdate(
            { _user: confirmation._user },
            { $set: { status: 1 } },
            { new: true },
            function (err, transaction) {
                if (err) return console.log(err)
                console.log('\n transaction: ' + transaction)
            })
        Shop.findOneAndUpdate(
            { _id: req.params.id },
            { $inc: { balance: 200 } },
            { new: true },
            function (err, shop) {
                if (err) return console.log(err)
                console.log('\n shop: ' + shop)
            })
    })
})