const express = require('express'); 
const app = express();  
const ejs = require('ejs'); 
const eventData = require('./model/database');

let users = [
    {
        username: 'dog468@ap.be',
        password: 'X6q1rk.rGZ'
    },
    {
        username: 'cat357@ap.be',
        password: '>#XzsAQ1Yv',
    },
    {
        username: 'admin@ap.be',
        password: '562=JY}qNj'
    }
]

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const session = require('express-session');
app.set('view engine', 'ejs'); 
app.use(express.static(__dirname + '/public')); 

app.use(session({
    secret: 'keyboard dance',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        maxAge:1000 * 60 *10
    },
    rolling:true
}))

// Fuzzy search
// test(), es6 methode behoort RegExp(). MDN Web Docs
// return een 'boolean'
const selectMatchItem = (list, keyword) => {
    let reg = new RegExp(keyword);
    let resArry = [];
    list.filter(item => {
        for(let i in item) {
            // if ture, push in resArry
            if(reg.test(item[i])) {
                resArry.push(item);
            }
        }
    })
    return resArry;
}

const getAEvent = (allEvent, id) => {
    let myEvent = allEvent
        .filter(item => item.id === id)
        .map(val => ({
            name:val?.name || undefined,
            images: val?.images || undefined,
            dates:val?.dates || undefined,
            datesLoc:val?.datesLoc || undefined,
            promoter:val?.promoter || undefined,
            venuesCity:val?.venuesCity || undefined,
            venuesCountry:val?.venuesCountry || undefined,
            venuesAddress:val?.venuesAddress || undefined,
            priceRanges:val?.priceRanges || undefined,
            priceRanges1:val?.priceRanges1 || undefined,
            attractions:val?.attractions || undefined
        })
    );

    return myEvent;
}

(async () => {
    const allEvent = await eventData;
    // console.log(allEvent);
    console.log("++++++++++++++++++");

    app.get('*', async(req,res,next) => {
        let userinfo = await req.session.user;
        let path = req.path;
        
        if(path == '/login' || path == '/doLogin' || path == '/') {
            next();
        } else {
            if (userinfo) {
                req.app.locals['userinfo'] = req.session.user;
                // console.log('userinfo', req.session.user);
                next()
            } else {
                res.redirect('/login');
                
            }
        }
      
    })
    
    // routes
    app.get('/', async(req,res,next) => {
        res.redirect('/login')
    })

    
    // route uc 8
    app.get('/login', async(req,res,next) => {
        res.render('uc8/login', {
            title: 'Log in'
        })
    })

    app.post('/doLogin', async(req,res,next) => {
        if(!req.body.password || !req.body.password.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{10,}$/) || !req.body.username || !req.body.username.match(/^([a-z0-9_\.-]+)@ap\.be$/)) 
        {
            res.send(`<script>alert('validation is fail_id');location.href='/login'</script>`)
        } 

        let username = req.body.username;
        let password = req.body.password;
            
        let resFound = users.find(item => item.username === username && item.password === password);
        if(resFound != null) {
            req.session.user = {
                username: username,
                password: password
            }
            res.redirect('/profile');
            
        } else {
                res.send(`<script>alert('Foute gebruikersnaam of wachtwoord.');location.href='/login'</script>`)
        }   
    })

    app.get('/logout', async(req,res,next) => {
        // console.log('session.user', req.session);
        req.session.destroy((err) => {
            if(err) {
                console.log(err);
            } else {
                res.redirect('/');
            }
        })
    })
    
    app.get('/profile', async(req,res,next) => {
        res.render('uc8/profile', {
            title: 'Maak je profiel aan'
        })
    })
    
    app.get('/bestemmingen', async(req,res,next) => {
        res.render('uc8/bestemmingen', {
            title: 'Bestemmingen'
        })
    })
    
    app.get('/bestemming', async(req,res,next) => {
        res.render('uc8/bestemming', {
            title: 'Bestemming'
        })
    })
    
    app.get('/bestellen', async(req,res,next) => {
        res.render('uc8/bestellen', {
            title: 'Bestellen'
        })
    })
    
    app.get('/bevestig', async(req,res,next) => {
        res.render('uc8/bevestig', {
            title: 'Bevestig'
        })
    })
    
    // route uc 9
    app.get('/events', async(req,res,next) => {
        const list = await allEvent;
        res.render('uc9/events', {
            title: 'Events',
            list:list
        })
    });

    app.get('/event/', async(req,res,next) => {
        if (!req.query.id || !req.query.id.match(/^([0-9a-zA-Z_\-]){10,20}$/)) {
            res.send(`<script>alert('Validatie van event is mislukt.');location.href='/events'</script>`)
        } else {
            let id = req.query.id;
            let data = await getAEvent(allEvent, id);
            
            if(data.length < 1) {
                res.send(`<script>alert('Geen zoek events gevonden!');location.href='/events'</script>`)
            }
            res.render('uc9/event', {
                title: data[0].name,
                list: data[0]
            })
            console.log('data',data.length);            
        }            
    })
    
    app.get('/raadplegen', async(req,res,next) => {
        res.render('uc9/eventraadplegen', {
            title: 'Event & attracties Raadplegen'
        })
    })
    
    app.post('/doSearch/', async(req,res,next) => {
        if(!req.body.search || !req.body.search.match(/^([0-9a-zA-Z\-]){3,10}$/)){
            res.send(`<script>alert('Validatie van trefwoord is mislukt.');location.href='/events'</script>`)
        } else {
            let keyword = req.body.search;
            
            res.redirect('/myEvents?keyword=' + `${keyword}`);
            console.log(keyword);
        }
        
    })
    
    app.get('/myEvents/', async(req,res,next) => {
        if(!req.query.keyword || !req.query.keyword.match(/^([0-9a-zA-Z\-]){3,10}$/)){
            res.send(`<script>alert('Validatie van trefwoord is mislukt(2)!');location.href='/events'</script>`)
        } else {
            let keyword = req.query.keyword;
            let data = selectMatchItem(allEvent, keyword)
            
            // Deduplication
            // Als een dubbele ID wordt gevonden, wordt dit element weggegooid.
            let obj = {}; 
            let newData =  data.reduce((cur,next) => {
                obj[next.id] ? '' : obj[next.id] = true && cur.push(next);
                return cur;
            },[]);
            
            if (newData.length < 1) {
                res.send("<script>alert('Geen zoek events gevonden en keyword is hoofdlettergevoelig.');location.href='/events'</script>");
                console.log('not found');
                
            } else {
                res.render('uc9/events', {
                    title: 'Uw events & attracties',
                    list: newData
                });
                console.log(newData.length);
            }
            
        }
    })
    
    app.use((req,res)=> {
        res.send('404 error, pag exists not!');
    })
    
    app.set('port', (process.env.PORT || 5000)); 
    app.listen(app.get('port'));
})();



