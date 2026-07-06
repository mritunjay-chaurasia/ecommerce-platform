const { Router } = require('express');
const mongoose = require('mongoose');

const router = Router();

router.get('/', (req, res) => {
    const isHealthy = mongoose.connection.readyState === 1;

    res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        message: isHealthy ? 'ok' : 'unavailable',
    });
});

module.exports = router;
