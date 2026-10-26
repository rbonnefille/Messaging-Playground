import express from 'express';
const router = express.Router();
import SunCoClient from '../utils/suncoApi.js';
import checkOrigin from '../middleware/validateOrigin.js';
import { hasSuncoCredentials } from '../config/features.js';

router.use(checkOrigin);

if (hasSuncoCredentials) {
    router.get('/switchboardIntegration', async (_req, res) => {
        try {
            const sunCo = new SunCoClient();
            const switchboardIntegrations =
                await sunCo.listSwitchboardIntegrations();
            return res.json(switchboardIntegrations);
        } catch (error) {
            console.error('Error listing switchboard integrations:', error);
            return res
                .status(502)
                .json({ error: 'Switchboard service unavailable' });
        }
    });

    router.get('/', async (_req, res) => {
        try {
            const sunCo = new SunCoClient();
            const switchboards = await sunCo.listSwitchboards();
            return res.json(switchboards);
        } catch (error) {
            console.error('Error listing switchboards:', error);
            return res
                .status(502)
                .json({ error: 'Switchboard service unavailable' });
        }
    });

    router.patch('/', async (req, res) => {
        try {
            const sunCo = new SunCoClient();
            const { enabled, defaultSwitchboardIntegrationId } = req.body;
            const switchboards = await sunCo.updateSwitchboard(
                enabled,
                defaultSwitchboardIntegrationId
            );
            return res.json(switchboards);
        } catch (error) {
            console.error('Error updating switchboard:', error);
            return res
                .status(502)
                .json({ error: 'Switchboard service unavailable' });
        }
    });

    router.patch('/switchboardIntegration', async (req, res) => {
        try {
            const sunCo = new SunCoClient();
            const switchboardIntegration = await sunCo.updateSwitchboardIntegration(
                req.body
            );
            return res.json(switchboardIntegration);
        } catch (error) {
            console.error('Error updating switchboard integration:', error);
            return res
                .status(502)
                .json({ error: 'Switchboard service unavailable' });
        }
    });

    router.post('/switchboardIntegration', async (req, res) => {
        try {
            const sunCo = new SunCoClient();
            const {
                integrationName,
                integrationId,
                deliverStandbyEvents,
                nextSwitchboardIntegrationId,
                messageHistoryCount,
            } = req.body;
            const newSwitchboardIntegration =
                await sunCo.createSwitchboardIntegration(
                    integrationName,
                    integrationId,
                    deliverStandbyEvents,
                    nextSwitchboardIntegrationId,
                    messageHistoryCount
                );
            return res.json(newSwitchboardIntegration);
        } catch (error) {
            console.error('Error creating switchboard integration:', error);
            return res
                .status(502)
                .json({ error: 'Switchboard service unavailable' });
        }
    });
}
else {
    router.use((req, res) => {
        res.status(403).json({ error: 'Sunco credentials not configured' });
    });
}
export default router;
