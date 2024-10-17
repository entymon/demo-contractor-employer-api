const { Router } = require('express');
const { getContractById, getContracts } = require('./controller/contract.controller');

const router = express.Router();
const contractRouter = express.Router();

contractRouter.get("/", getContracts)
contractRouter.get("/:id", getContractById)

// const jobRouter = express.Router();
// const adminRouter = express.Router();
// const balanceRouter = express.Router();

router.use("/contracts", contractRouter);
// router.use("/jobs", jobRouter);
// router.use("/admin", adminRouter);
// router.use("/balances", balanceRouter);

export default router;