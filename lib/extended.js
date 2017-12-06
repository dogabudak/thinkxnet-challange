var    mongojs = require('mongojs'),
config = require('../resource/config.js'),
db = mongojs(config.mongo.url,['test']);


db.on('error', function (err) {
  console.log('database error', err)
})

db.on('connect', function () {
    console.log('database connected')
})

function rangeAggregate(startDate,endDate,thresholdArr){
  let maxNumber = 999; //hard-coded cap
  let minNumber = 0;   //hard-coded cap
  var resultArr =[];
  if (thresholdArr.length > 2 || thresholdArr[0] > thresholdArr [1] || thresholdArr[1] > 999 || thresholdArr[0]< minNumber) throw("not implemented")
  thresholdArr.push(maxNumber);
  thresholdArr.unshift(minNumber);
  return new Promise(
    function(fullfill,reject){
      function recursiveFunc(thresholdArr){
        let smallerNumber = thresholdArr[0];
        let biggerNumber = thresholdArr[1];
        if (thresholdArr.length === 1) { return fullfill(resultArr)}
        db.test.aggregate([{ $match: { "timestamp": {$gte: new Date(startDate),$lt: new Date(endDate)}}},{$project:{"partitions":{$filter:{input:"$partitions",as:"partition",cond: { $and: [{ $lte: [ "$$partition.key", biggerNumber ]},{$gt: [ "$$partition.key", smallerNumber ] }]}}}}},{ $unwind: "$partitions" } , {$group: { _id : "key", below: { $sum: "$partitions.val" } } }], function(err,result){
          if (err) reject(err);
          result[0]["key"]=biggerNumber;
          delete result[0]["_id"];
          resultArr.push(result);
          thresholdArr.shift();
          recursiveFunc(thresholdArr);
        })
      }
      recursiveFunc(thresholdArr)
    })
  }



  rangeAggregate('2016-02-01','2016-02-03',[10,35]).then(result => console.log(result))
