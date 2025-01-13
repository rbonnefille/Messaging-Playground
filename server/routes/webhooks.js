import express from 'express';
const router = express.Router();

router.post('/', (req, res) => {
  // if (req.body.app?.id) {
  //   console.log(JSON.stringify(req.body, null, 4));
  // }
  res.sendStatus(200);
});

export default router;
