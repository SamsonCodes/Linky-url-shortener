const express = require("express");
const app = express();
const port = 3000;
const _ = require("lodash");
app.use(express.static('public'));

const mongoose = require("mongoose");
mongoose.connect('mongodb://localhost:27017/urlShorterDB', {useNewUrlParser: true, useUnifiedTopology: true});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.set('view engine', 'ejs')

const urlMappingSchema = {
  shortUrl: String,
  destinationUrl: String
};

const UrlMapping = mongoose.model('UrlMapping', urlMappingSchema);

const mapping1 = new UrlMapping({
  shortUrl: "bigG",
  destinationUrl: "https://www.google.nl"
});

let currentMessage = "Let's shorten some urls!";

app.get('/', function(req, res){
  UrlMapping.find({}, function(err, foundMappings){
    if(err) return console.log(err);
    res.render("home", {message: currentMessage, mappings: foundMappings})
  });
});

app.post('/', function(req, res){
  console.log("post");
  newShortUrl = _.lowerCase(req.body.shortUrl);
  newDestinationUrl = req.body.destinationUrl;

  UrlMapping.findOne({shortUrl: newShortUrl}, function (err, foundMapping) {
    if (err) return console.error(err);
      if (!foundMapping) {
        const newMapping = new UrlMapping({
          shortUrl: newShortUrl,
          destinationUrl: newDestinationUrl
        });
        newMapping.save();
        currentMessage = "Url was added succesfully!";
        res.redirect("/");
      }
      else {
        currentMessage = "Short url already exists! Use a new one!";
        res.redirect("/");
      }
  });
});

app.post('/delete', function(req, res){
  checkedItemId = req.body.checkbox;
  UrlMapping.findByIdAndRemove(checkedItemId, function(err) {
    if (err) {
      console.log(err);
      currentMessage = "Could not delete!"
      res.redirect("/");
    }
    currentMessage = "Succesfully deleted!"
    res.redirect("/");
  });
});

app.get('/:shortPath', function(req, res){
  shortPath = _.lowerCase(req.params.shortPath);
  UrlMapping.findOne({shortUrl: shortPath}, function (err, foundMapping) {
    if (err) return console.error(err);
      if (!foundMapping) {
        currentMessage = "This path does not exist!";
        res.redirect("/");
      }
      else {
        res.redirect(foundMapping.destinationUrl);
      }
  });
})

app.listen(port, () => console.log('Example app listenening at http://localhost:${port}'));
