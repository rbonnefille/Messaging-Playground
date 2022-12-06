import express from "express";
const router = express.Router();
import SunCoClient from "../utils/suncoApi.js";

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

router.get("/:id/clients", async (req, res) => {  
    const userId = req.params.id;    
    const sunCo = new SunCoClient();
    const conversations = await sunCo.listClients(userId);
    res.json(conversations)
})

export default router;