function readEvents(req, res, next) {
  if (req.body.events[0].type === "conversation:read") {
    console.log("message read");
    res.end();
  } else {
    return next();
  }
}

module.exports = readEvents;