const fs = require("fs");
const logger = (req, res, next) => {
  if (req.body?.events[0]?.payload?.message?.author?.type === "user") {
    console.log(`#####################################################`);
    console.log(`Event type: ${req.body.events[0]?.type}`);
    console.log(
      `Message from: ${req.body.events[0]?.payload?.message?.author?.type}`
    );

    var stream = fs.createWriteStream(
      "/Users/rbonnefille/Documents/Testing/SmoochLibs/NodeJSLib/suncoBot/logs/logs.log",
      { flags: "a" }
    );
    // stream.write(JSON.stringify(req.body, null, 2) + ",\n");
    stream.write(
      `${req.body.events[0]?.createdAt} - UserId: ${req.body.events[0]?.payload?.message?.author.userId} - ConversationId: ${req.body.events[0]?.payload?.conversation?.id}\n`
    );
    stream.on("error", (err) => {
      console.log(`Error in read stream... ${err}`);
    });
    stream.end();
  }
  next();
};

module.exports = logger;
