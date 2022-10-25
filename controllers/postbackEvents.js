const postbackEvents = (req, res, next) => {
    const eventType = req.body.events[0].type;
    const postbackPayload = req.body.events[0].payload.postback.payload;
  if (eventType === "conversation:postback") {
    console.log(
      `Message postback`
    );
    res.end();
  } else {
    return next();
  }
};

module.exports = postbackEvents;