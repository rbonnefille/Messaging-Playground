import express from 'express';
import * as dotenv from 'dotenv';
dotenv.config();
import * as helmet from 'helmet';
import cors from 'cors';
import routes from './routes/index.js';
import loggerMiddleware from './utils/logger.js';

const { PORT: port } = process.env;
const defaultPort = 3000;

const app = express();
app.use(loggerMiddleware);
app.use(cors());
app.use(helmet.hidePoweredBy());
app.use(helmet.xssFilter());
app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf.toString();
        },
    })
);
app.use(express.urlencoded({ extended: false }));

app.use(routes);

// Catch malformed JSON from body-parser so a bad payload returns 400 instead of an unhandled crash
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('Invalid JSON received:', err.message);
        console.error('Raw body:', req.rawBody);
        return res
            .status(400)
            .json({ error: 'Invalid JSON payload', detail: err.message });
    }
    return next(err);
});

app.listen(port ?? defaultPort, () =>
    console.log(`Server is running on port ${port ?? defaultPort}`)
);
