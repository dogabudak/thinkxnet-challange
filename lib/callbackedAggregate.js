var    mongojs = require('mongojs'),
config = require('../resource/config.js'),
db = mongojs(config.mongo.url,['users']);


db.on('error', function (err) {
  console.log('database error', err)
})

db.on('connect', function () {
  console.log('database connected')
})



function lessThan(startDate,endDate,threshold,callbackfunction){
  db.test.aggregate([{ $match: { "timestamp": {$gte: new Date(startDate),$lt: new Date(endDate)}}},{$project:{"partitions":{$filter:{input:"$partitions",as:"partition",cond: { $lte: [ "$$partition.key", threshold ] }}}}},{ $unwind: "$partitions" } , {$group: { _id : "key", below: { $sum: "$partitions.val" } } }], function(err,result){
    callbackfunction(null,result);
  })
}

function greaterThan(startDate,endDate,threshold,callbackfunction){
  db.test.aggregate([{ $match: { "timestamp": {$gte: new Date(startDate),$lt: new Date(endDate)}}},{$project:{"partitions":{$filter:{input:"$partitions",as:"partition",cond: { $gt: [ "$$partition.key", threshold ] }}}}},{ $unwind: "$partitions" } , {$group: { _id : "key", above: { $sum: "$partitions.val" } } }], function(err,result){
      callbackfunction(null,result);
    })
  }



   var sum = function(startDate,endDate,threshold,callback) {
      greaterThan(startDate,endDate,threshold,function(err,callback1){
        lessThan(startDate,endDate,threshold,function(err,callback2){
          let keyObj= {'key':threshold};
          let returnObj = Object.assign(callback1[0],callback2[0],keyObj);
          callback(null,returnObj)
        })
      })
  }

  module.exports = sum;
