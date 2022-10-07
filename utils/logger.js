function logger(req, res, next) {
    if (req.method === 'HEAD') {
      res.status(200);
      return;
    }
    if (req.body?.events[0]?.payload?.message?.author?.type === "user") {
      console.log(`#####################################################`);
      console.log(`Event type: ${req.body.events[0]?.type}`);
      console.log(`Message from: ${req.body.events[0]?.payload?.message?.author?.type}`);
      console.log(JSON.stringify(req.body, null, 2));      
    }
    next();
  };

module.exports = logger;