const sum = require('./lib/promisedAggregate.js');

    sum('2016-02-01','2016-02-03',[10,35],(err,result)   =>   {
      console.log(err, result)
    });
