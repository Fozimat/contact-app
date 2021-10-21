const express = require('express')
const expressLayouts = require('express-ejs-layouts')

const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')

require('./utils/db')
const Contact = require('./model/contact')

const app = express()
const port = 3000

app.set('view engine', 'ejs')
app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser('secret'))
app.use(session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))
app.use(flash())

app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'Fozimat',
            email: 'fozimata@gmail.com'
        },
        {
            nama: 'Lisa',
            email: 'lisa@gmail.com'
        },
        {
            nama: 'Ari',
            email: 'ari@gmail.com'
        },
    ]
    res.render('index',
        {
            nama: 'Fozimat',
            title: 'Halaman Home',
            mahasiswa,
            layout: 'layouts/main-layout'
        });
})

app.get('/about', (req, res) => {
    res.render('about', {
        title: 'Halaman About',
        layout: 'layouts/main-layout'
    })
})

app.get('/contact', async (req, res) => {
    const contacts = await Contact.find();
    res.render('contact',
        {
            title: 'Halaman Contact',
            layout: 'layouts/main-layout',
            contacts,
            msg: req.flash('msg')
        }
    )
})

app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({
        nama: req.params.nama
    });
    res.render('detail',
        {
            title: 'Halaman Detail Contact',
            layout: 'layouts/main-layout',
            contact
        }
    )
})

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`)
})