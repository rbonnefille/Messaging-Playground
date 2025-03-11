import express from 'express';
const router = express.Router();

router.post('/', (_, res) => {
  // if (req.body.app?.id) {
  //   console.log(JSON.stringify(req.body, null, 4));
  // }
  res.sendStatus(200).end();
});

router.head('/', (_, res) => {
  res.sendStatus(200).end();
});

export default router;
