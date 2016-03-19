var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var short = require('short');

var root = process.env.ROOT;

short.connect('mongodb://localhost/short');

short.connection.on('error', function(error) {
  console.error(error);
});

app.set('view engine', 'jade');
app.set('port', (process.env.PORT || 5000));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.render('index', { root: root });
});

app.post('/shorten', function (req, res, next) {
  var url = req.body.url;

  var shortURLPromise = short.generate({
    URL : url
  });

  shortURLPromise.then(function(mongodbDoc) {
    short.retrieve(mongodbDoc.hash).then(function(result) {
      res.send(result);
    }, function(error) {
      console.error(error);
    });
  }, function(error) {
    if (error) {
      console.error(error);
    }
  });
});

app.get('/stats', function (req, res) {
  short.list().then(function(result) {
    res.render('stats', { result: result });
  }, function (error) {
    res.render('error', { error: error });
  })
});

app.get('/:hash', function (req, res, next) {
  var hash = req.params.hash;

  short.retrieve(hash).then(function(result) {
    res.redirect(result.URL);
  }, function (error) {
    console.error(error);
  });
});

app.listen(app.get('port'), function () {
  console.log('Server up and running on ' + app.get('port'));
});
