const sum = require('./lib/callbackedAggregate.js');

  sum('2016-02-01','2016-02-03',10,(err,result)   =>   {
    console.log(err, result)
  });
