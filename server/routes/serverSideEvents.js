import express from "express";
import compression from "compression";
const router = express.Router();

router.use(compression());

router.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  // console.log(req.headers);

  // Access xhrFields from req
  const xhrFields =
    req.headers["x-requested-with"] === "XMLHttpRequest"
      ? req.headers["xhr-fields"]
      : null;
  console.log(xhrFields);

  // send a ping approx every 2 seconds
  const timer = setInterval(function () {
    res.write(
      `data: ping - timestamp: ${new Date(new Date().getTime()).toLocaleTimeString()}\n\n`,
    );
    // !!! this is the important part
    res.flush();
  }, 2000);

  res.on("close", function () {
    clearInterval(timer);
  });
});

export default router;
