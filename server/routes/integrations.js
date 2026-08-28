import express from 'express';
const router = express.Router();
import SunCoClient from '../utils/suncoApi.js';
import checkOrigin from '../middleware/validateOrigin.js';

router.use(checkOrigin); // Register the checkOrigin middleware globally

router.get('/', async (_, res) => {
    try {
        const sunCo = new SunCoClient();
        const integrations = await sunCo.listIntegrationsPerChannelResponder();
        return res.json(integrations);
    } catch (error) {
        console.error('Error listing integrations:', error);
        return res
            .status(502)
            .json({ error: 'Integration service unavailable' });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const { id: integrationId } = req.params;
        const sunCo = new SunCoClient();
        const integrations = await sunCo.updateIntegration(
            integrationId,
            req.body
        );
        return res.json(integrations);
    } catch (error) {
        console.error('Error updating integration:', error);
        return res
            .status(502)
            .json({ error: 'Integration service unavailable' });
    }
});

export default router;
