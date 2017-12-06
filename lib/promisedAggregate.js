var    mongojs = require('mongojs'),
config = require('../resource/config.js'),
db = mongojs(config.mongo.url,['test']);


db.on('error', function (err) {
  console.log('database error', err)
})

db.on('connect', function () {
  console.log('database connected')
})

function lessThan(startDate,endDate,threshold,callback){
  return new Promise(
    function(fullfill,reject){
      db.test.aggregate([{ $match: { "timestamp": {$gte: new Date(startDate),$lt: new Date(endDate)}}},{$project:{"partitions":{$filter:{input:"$partitions",as:"partition",cond: { $lte: [ "$$partition.key", threshold ] }}}}},{ $unwind: "$partitions" } , {$group: { _id : "key", below: { $sum: "$partitions.val" } } }], function(err,result){
        if (err) reject(err);
        fullfill(result)
      })
    })
  }
  function greaterThan(startDate,endDate,threshold,callback){
    return new Promise(
      function(fullfill,reject){
        db.test.aggregate([{ $match: { "timestamp": {$gte: new Date(startDate),$lt: new Date(endDate)}}},{$project:{"partitions":{$filter:{input:"$partitions",as:"partition",cond: { $gt: [ "$$partition.key", threshold ] }}}}},{ $unwind: "$partitions" } , {$group: { _id : "key", above: { $sum: "$partitions.val" } } }], function(err,result){
          if (err) reject(err);
          fullfill(result)
        })
      })
    }

var sum = function(startDate,endDate,threshold,callback) {
     Promise.all([
       greaterThan(startDate,endDate,threshold,callback),
       lessThan(startDate,endDate,threshold,callback)
     ])
     .then(([result1, result2]) => {
     let keyObj= {'key':threshold};
     let returnObj = Object.assign(result1[0],result2[0],keyObj);
       callback(null,returnObj)
     })
     .catch(err => {
       console.log(err)
     });
  }

    module.exports = sum;
