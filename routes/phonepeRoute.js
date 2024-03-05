import { Router } from 'express';
import { checkStatus, newPayment } from '../controller/phonepeController.js';
const router = Router();


router.post('/payment', newPayment);
router.post('/status/:txnId', checkStatus);
router.post("/test", (req, res) => {
    console.log("router me aaya",req.body)
    res.json({ "success": true, "data": req.body });
  });


export default router;

