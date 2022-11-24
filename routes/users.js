const express = require("express");
const router = express.Router();
const { SunCoClient } = require("../utils/suncoApi");

router.get("/:id", async (req, res) => {
    const userId = req.params.id;    
    const sunCo = new SunCoClient();
    const user = await sunCo.getUser(userId);
    res.json(user)
})

router.get("/:id/conversations", async (req, res) => {
    const userId = req.params.id;    
    const sunCo = new SunCoClient();
    const conversations = await sunCo.listConversations(userId);
    res.json(conversations)
})

module.exports = router;





