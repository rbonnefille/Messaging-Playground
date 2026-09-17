import express from 'express';
import compression from 'compression';
const router = express.Router();

router.use(compression());

router.get('/', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const xhrFields =
        req.headers['x-requested-with'] === 'XMLHttpRequest'
            ? req.headers['xhr-fields']
            : null;
    console.log(xhrFields);

    const timer = setInterval(function () {
        res.write(
            `data: ping - timestamp: ${new Date(new Date().getTime()).toLocaleTimeString()}\n\n`
        );
        res.flush();
    }, 2000);

    res.on('close', function () {
        clearInterval(timer);
    });
});

export default router;
