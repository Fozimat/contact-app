const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { body, validationResult, check } = require('express-validator')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')
const methodOverride = require('method-override')

require('./utils/db')
const Contact = require('./model/contact')

const app = express()
const port = 3000

app.use(methodOverride('_method'))

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

app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Tambah Data Kontak',
        layout: 'layouts/main-layout'
    })
})

const checkRule = [body('nama').custom(async (value) => {
    const duplikat = await Contact.findOne({ nama: value })
    if (duplikat) {
        throw new Error('Nama kontak sudah digunakan')
    }
    return true
}), check('email', 'Email tidak valid').isEmail(), check('noHp', 'No hp tidak valid').isMobilePhone('id-ID')]

app.post('/contact', checkRule, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('add-contact', {
            title: 'Tambah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array()
        })
    } else {
        Contact.insertMany(req.body, (error, result) => {
            req.flash('msg', 'Data contact berhasil ditambahkan')
            res.redirect('/contact')
        })
    }
})

app.delete('/contact', (req, res) => {
    Contact.deleteOne({ nama: req.body.nama }).then((result) => {
        req.flash('msg', 'Data contact berhasil dihapus')
        res.redirect('/contact')
    })
})

app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama })
    res.render('edit-contact', {
        title: 'Edit Data Contact',
        layout: 'layouts/main-layout',
        contact
    })
})

const checkRuleUpdate = [body('nama').custom(async (value, { req }) => {
    const duplikat = await Contact.findOne({ nama: value })
    if (value !== req.body.oldNama && duplikat) {
        throw new Error('Nama kontak sudah digunakan')
    }
    return true
}), check('email', 'Email tidak valid').isEmail(), check('noHp', 'No hp tidak valid').isMobilePhone('id-ID')]

app.put('/contact', checkRuleUpdate, (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.render('edit-contact', {
            title: 'Edit Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact: req.body
        })
    } else {
        Contact.updateOne({
            _id: req.body._id
        },
            {
                $set: {
                    nama: req.body.nama,
                    email: req.body.email,
                    noHp: req.body.noHp
                }
            }).then((result) => {
                req.flash('msg', 'Data contact berhasil diubah')
                res.redirect('/contact')
            })
    }
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

