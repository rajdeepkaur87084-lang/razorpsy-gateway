
const express = require("express");
const Razorpay = require("razorpay");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

app.post("/api/create-order", async (req, res) => {
  try {
    const order = await razorpay.orders.create({
      amount: req.body.amount * 100,
      currency: "INR",
      receipt: "rcpt_"+Date.now()
    });
    res.json(order);
  } catch(e){ res.status(500).send(e); }
});

app.post("/api/verify-payment", (req,res)=>{
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const hash = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");
  if(hash===razorpay_signature) res.json({success:true});
  else res.json({success:false});
});

app.use(express.static("public"));
app.listen(5000, ()=> console.log("Running on 5000"));
