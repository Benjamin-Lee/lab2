const express = require('express');
const path = require('path');
require('cross-fetch/polyfill');

const app = express();
const host = '127.0.0.1';
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const API_KEY = '7ad657f0-b77e-11e8-bf0e-e9322ccde4db';

let comments = {}; // holds a mapping from object ids to lists of their comments

// behavior for the index route
app.get('/', (req, res) => {
  const url = `https://api.harvardartmuseums.org/gallery?size=100&apikey=${API_KEY}`;
  fetch(url)
  .then(response => response.json())
  .then(data => {
    res.render('index', {galleries: data.records});
  });
});

app.get('/gallery/:gallery_id', function(req, res) {
    // show the list of objects for a given gallery
    fetch(`https://api.harvardartmuseums.org/object?apikey=${API_KEY}&gallery=${req.params.gallery_id}&size=999`)
    .then(response => response.json())
    .then(data => {
        res.render('gallery', {objects: data.records, gallery_id: req.params.gallery_id});
    })
});

app.get('/object/:object_id', function(req, res) {
  // shows the details for a given object id
  fetch(`https://api.harvardartmuseums.org/object/${req.params.object_id}?apikey=${API_KEY}`)
  .then(response => response.json())
  .then(data => {
      let object_comments = comments[req.params.object_id] ? comments[req.params.object_id] : []
      res.render('details', {detail: data, object_id: req.params.object_id, comments : object_comments});
  });
});

app.get("/submit_comment/:object_id/:comment", function(req, res) {
    // route for comment submission
    if (comments[req.params.object_id]) {
        comments[req.params.object_id].push(req.params.comment);
    } else {
        comments[req.params.object_id] = []
        comments[req.params.object_id].push(req.params.comment);
    }
});

app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}/`);
});
