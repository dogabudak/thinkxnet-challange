const assert = require("assert"),
mongojs = require('mongojs'),
config = require('../resource/config.js'),
db = mongojs(config.mongo.url,['test']),
sumCallback = require('../lib/callbackedAggregate.js'),
sumPromise = require('../lib/promisedAggregate.js'),
mongoData ={"timestamp": new Date("2016-02-02"),"partitions": [{ "key": 5, "val": 20 },{ "key": 10, "val": 15 },{ "key": 15, "val": 55 },{ "key": 35, "val": 1 },{ "key": 95, "val": 22 },]};



describe("checkData", function() {
  it("compares the data with promise", function(done){
    sumPromise('2016-02-01','2016-02-03',10,function(err,result){
      if (result.above == 78 && result.below == 35 ) done();
      else {
        throw new Error('wrong result!');
      }
    });
  });
  it("compares the data callback", function(done){
    sumCallback('2016-02-01','2016-02-03',10,function(err,result){
      if (result.above == 78 && result.below == 35 ) done();
      else {
        throw new Error('wrong result!');
      }
    });
  });

});
