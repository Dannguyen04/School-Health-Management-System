const router = require("express").Router();
const controller = require("../controllers/VaccinationCampaignController");
const auth = require("../middleware/authenticateToken");

router.post("/", auth.verifyToken, controller.createCampaign);

module.exports = router;
