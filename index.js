const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const upload = multer({ dest: './uploads/imagenes' });
const exphbs = require('express-handlebars');
const Club = require('./models/club');

const PUERTO = 8080;
const app = express();
const hbs = exphbs.create();

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(`${__dirname}/uploads`));

function obtenerEquipos() {
  return JSON.parse(fs.readFileSync('./data/equipos.json'));
}

app.get('/equipos', (req, res) => {
  const equipos = obtenerEquipos()
  
  res.render('home', {
    layout: 'estructura',
    data: {
      equipos
    }
  });
});

app.get('/equipos/:id/ver', (req, res) => {
  const equipos =  obtenerEquipos()
  const id = req.params.id
  res.render('mostrar-equipo', {
    layout: 'estructura',
    data: {
      equipo: equipos.find(equipo => equipo.id === id)
    }
  });
});


app.get('/equipos/:id/editar', (req, res) => {
  const equipos = obtenerEquipos()
  const id = req.params.id
  res.render('formulario-equipo-editar', {
    layout: 'estructura',
    data: {
      equipo: equipos.find(equipo => equipo.id === id)
    }
  });
});

app.post('/equipos/:id/editar', upload.single('crestUrl'), (req, res) => {
  const id = req.params.id
  const equipos = obtenerEquipos()
  const {name, shortname, tla, adress, phone, website, email, founded, clubColors, venue,} = req.body
  const indiceClub = equipos.findIndex(equipo => equipo.id === id)
  let crestUrl =   equipos[indiceClub].crestUrl
  if(req.file.filename) {
    crestUrl = `/imagenes/${req.file.filename}`
  }
  const club = new Club(id,{id: 2072, name: "England"}, name, shortname, tla, crestUrl, adress, phone, website, email, founded, clubColors, venue)
  equipos[indiceClub] = club
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos), 'utf-8' )
  res.redirect("/equipos")
  console.log(JSON.stringify(equipos), club, indiceClub)
});

app.get('/equipos/agregar/', (req, res) => {
  res.render('formulario-equipo-agregar', {
    layout: 'estructura'})
  
});

app.post('/equipos/agregar/', upload.single('crestUrl'), (req, res) => {
  const equipos = obtenerEquipos()
  const {id, name, shortname, tla, adress, phone, website, email, founded, clubColors, venue} = req.body
  const club = new Club(uuidv4(),{id: 2072, name: "England"}, name, shortname, tla, `/imagenes/${req.file.filename}`, adress, phone, website, email, founded, clubColors, venue)
  equipos.push(club)
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos), 'utf-8' );
  res.redirect("/equipos")
});

app.get('/equipos/:id/borrar', (req, res) => {
  const equipos = obtenerEquipos()
  const idEquipo = req.params.id
  const indiceClub = equipos.findIndex(equipo => equipo.id === idEquipo)
  equipos.splice(indiceClub, 1)
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos), 'utf-8' );
  res.redirect("/equipos")
});


app.listen(PUERTO);
console.log(`Escuchando en http://localhost:${PUERTO}`);

