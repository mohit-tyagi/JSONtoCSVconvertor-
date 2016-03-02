var _config = require('./config');
var fs = require('fs');
var providedByYou = require('./providedByYou.json');
var apiHitJson = require('./apiHit.json');
var fields = ['listingId', 'viewDirections'];

// CSV
var json2csv = require('json2csv');

// API
/* var request = require('request-json');
var path = require('path');
var client = request.createClient(_config.baseUrl);
client.get(path.join(_config.projectId + query), function(err, res, body) {
    return console.log(body);
});*/

//console.log(apiHitJson.data.listings);

var parseFromApi = function(list){
    var resultList = [], resultObject = {};
    list.forEach(function(data){
        var splitResult = data.flatNumber.split('-');
        var obj = {
            listingId:data.id,
            towerName:splitResult[0],
            unitSide:splitResult[1].length == 3 ?+splitResult[1].substring(1,3):+splitResult[1].substring(2,4)
        };
        data.custom = obj.towerName + '-' + obj.unitSide;
    });
    return list;
};

var parseProvideByYou = function(list){
    var resultList = [], resultObject = {};
    list.forEach(function(data){
        var obj = {
            towerName:data.towerName,
            unitSide:data.unitSide
        };
        resultObject[obj.towerName + '-' + obj.unitSide] = data.viewDirection.join(';');
    });
    return resultObject;
};


var finalResult = function(fromApi,providedByYou){
    var resultList = [];
    fromApi.forEach(function(data){
        if(providedByYou[data.custom]){
            resultList.push({
                listingId:data.id,
                viewDirections:providedByYou[data.custom]
            });
        }else{
            resultList.push({
                listingId:data.id,
                viewDirections:''
            });
        }
    });
    return resultList;
};

var fromApi = parseFromApi(apiHitJson.data.listings);
var providedByYou = parseProvideByYou(providedByYou.facingData);
var result = finalResult(fromApi,providedByYou);

json2csv({ data: result, fields: fields }, function(err, csv) {
    if (err) console.log(err);
    fs.writeFile('file.csv', csv, function(err) {
        if (err) throw err;
        console.log('file saved');
    });
});

// Create .csv File
