const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const Bing = require("node-bing-api")({accKey: 'ce72ba8c31f84c239a3693ce3d2ff61f'});
const searchTerm = require('./models/searchTerm');


app.use(bodyParser.json());
app.use(cors());
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/searchTerms');

// // get all search terms from database
app.get('/api/recentsearches', (req, res)=>{
  searchTerm.find({}, (error, data)=>{
    res.json(data);
  });
});

// Get call search image
app.get('/api/imagesearch/:searchVal*', (req, res)=>{
  var  searchVal   = req.params.searchVal;
  var  offset   = req.query.offset;
  
  var data = new searchTerm ({
    searchVal, 
    searchDate: new Date()
  });
  
  data.save(err =>{
   if(err){
     return res.send('Database Error');
   }
  });
  
  var searchOffset
  if(offset){
    if(offset == 1){
      offset = 0;
      searchOffset = 1;
    }
    else if (offset > 1){
      searchOffset = offset + 1;
    }
  }
  
  Bing.images(searchTerm, {
    top:(10 * searchOffset),
    skip: (10 * offset)
  }, function(error, res, body){
    var bingData = [ ];
    
    for(var i = 0; i< 10; i++){
      bingData.push({
        url: body.value[i].webSearchUrl,
        snippet: body.value[i].name,
        thumbnail: body.value[i].thumbnailUrl,
        context: body.value[i].hostPageDisplayUrl
      });
    }
    res.json(bingData);
  });
});


app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server connected!");
})