const router = require("express").Router();
import {
    authenticateToken,
    verifyAdmin,
} from "../middleware/authenticateToken.js";

import { getAllRequiredVaccine } from "../controllers/VaccineController.js";

router.get("/vaccine", authenticateToken, getAllRequiredVaccine);

module.exports = router;
