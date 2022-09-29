function logger(req, res, next) {
    console.log(`#####################################################`);
    console.log(`Event type: ${req.body.events[0].type}`);
    console.log(`Message from: ${req.body.events[0].payload?.message?.author?.type}`);
    console.log(JSON.stringify(req.body, null, 2));
    next();
  };

module.exports = logger;