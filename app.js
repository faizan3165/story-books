const path = require('path');
const dotenv = require('dotenv');
const morgan = require('morgan');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const exphbs = require('express-handlebars');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');

const connectDB = require('./config/db');

// Load config 
dotenv.config({ path: './config/config.env' });

// Passport Config
require('./config/passport')(passport);

connectDB();

const app = express();

// Body Parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Methodoverride
app.use(methodOverride('_method'));

// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Handlebar Helpers
const {formatDate, truncate, stripTags, editIcon, select} = require('./helpers/hbs');

// Handlebars Setup
app.engine('.hbs', exphbs({ helpers: { formatDate, truncate, stripTags, editIcon, select }, defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

// Session Middleware
app.use(session({
    secret: 'thisisaveryboringsecret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Set Global Variable
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    if (req.user) {   
        res.locals.image = req.user.image ;
        res.locals.id = req.user._id;
        res.locals.story = req.story
    } else {
        res.locals.image = null;
        res.locals.id = null;

    }
    next();
})

// Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
});