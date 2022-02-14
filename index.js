const fs = require('fs');
const express = require('express');
const multer = require('multer');

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
  const id = Number(req.params.id)
  res.render('mostrar-equipo', {
    layout: 'estructura',
    data: {
      equipo: equipos.find(equipo => equipo.id === id)
    }
  });
});


app.get('/equipos/:id/editar', (req, res) => {
  const equipos = obtenerEquipos()
  const id = Number(req.params.id)
  res.render('formulario-equipo-editar', {
    layout: 'estructura',
    data: {
      equipo: equipos.find(equipo => equipo.id === id)
    }
  });
});

app.post('/equipos/:id/editar', upload.single('crestUrl'), (req, res) => {
  const equipos = obtenerEquipos()
  const {id, name, shortname, tla, adress, phone, website, email, founded, clubColors, venue,} = req.body
  const club = new Club(Number(id),{id: 2072, name: "England"}, name, shortname, tla, `/imagenes/${req.file.filename}`, adress, phone, website, email, founded, clubColors, venue,)
  const indiceClub = equipos.findIndex(equipo => equipo.id === Number(id))
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
  const club = new Club(Number(id),{id: 2072, name: "England"}, name, shortname, tla, `/imagenes/${req.file.filename}`, adress, phone, website, email, founded, clubColors, venue)
  equipos.push(club)
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos), 'utf-8' );
  res.redirect("/equipos")
});

app.get('/equipos/:id/borrar', (req, res) => {
  const equipos = obtenerEquipos()
  const idEquipo = Number(req.params.id)
  const indiceClub = equipos.findIndex(equipo => equipo.id === idEquipo)
  equipos.splice(indiceClub, 1)
  fs.writeFileSync('./data/equipos.json', JSON.stringify(equipos), 'utf-8' );
  res.redirect("/equipos")
});


app.listen(PUERTO);
console.log(`Escuchando en http://localhost:${PUERTO}`);

