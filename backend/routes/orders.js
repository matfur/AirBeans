const { Router } = require('express')
const router = new Router();

//Database 
const { db } = require('./../db')

router.post('/', (req, res) => {
    let id = generateUUID()
    let user = db.get('users').find({name: req.body.user}).get('history').value()
    if(req.body.user === undefined) {
        db.get('orders')
        .push({purchase: id, totalCost: req.body.totalCost, orderDate: req.body.orderDate, cartItems: req.body.cartItems})
        .write()
        res.send( {msg: 'ok!', orderNr: id, signedIn: false})

    } else {
        let newuser = db.get('users').find({name: req.body.user}).value()
        console.log('you just found the correct user', newuser, user)
        user.push({purchase: id, totalCost: req.body.totalCost, orderDate: req.body.orderDate, cartItems: req.body.cartItems})
        db.get('users').find({name: req.body.user})
        .assign({history: user})
        .write()


        /*//.push({purchase: id, totalCost: req.body.totalCost, orderDate: req.body.orderDate, cartItems: req.body.cartItems})
        db.get('orders')
        .push({user: req.body.user, purchase: id, totalCost: req.body.totalCost, orderDate: req.body.orderDate, cartItems: req.body.cartItems})
        //.push({user: req.body.user, purchase: id, totalCost: req.body.totalCost, orderDate: req.body.orderDate, cartItems: req.body.cartItems})
        .write()*/
        console.log('this is user in order.js')
        res.send({msg: 'ok!', orderNr: id, signedIn: true})
    }
    
})

function generateUUID() {
    let date = new Date().getTime();
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const random = (date + Math.random() * 16) % 16 | 0;
        date = Math.floor(date / 16);
        return (c === 'x' ? random : (random & 0x3 | 0x8)).toString(16);
    });
}

module.exports = router