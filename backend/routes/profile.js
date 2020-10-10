const { Router } = require('express')
const router = new Router();


//Database 
const { db } = require('./../db')

router.get('/', (req, res) => {
    //res.send('Products!!')
    
        if(req.query.user === 'undefined') {
            res.send(JSON.stringify({status: 'ok'}))
        }else {
            let user = db.get('users').find({name: req.query.user}).value()
            res.send(user)
        }
    
})


router.post('/create', (req, res) => {
    console.log('this is when creating a user', req.body)
    db.get('users').push({name: req.body.name, mail: req.body.mail, history: req.body.history}).write()
    // lägg till användare i databasen
    res.send(JSON.stringify({status: 'ok'}))

})

module.exports = router

