import crypto from "crypto";
import axios from "axios";
import { salt_key, merchant_id } from "../secret.js";

const newPayment = async (req, res) => {
  console.log("Received request:", req.body);
  try {
    const merchantTransactionId = req.body.transactionId;
    const data = {
      merchantId: merchant_id,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: req.body.MUID,
      name: req.body.name,
      amount: req.body.amount * 100,
      redirectUrl: `http://localhost:5000/api/status/${merchantTransactionId}`,
      redirectMode: "POST",
      mobileNumber: req.body.number,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = sha256 + "###" + keyIndex;

    // const prod_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay"
    const prod_URL =
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    try {
      const response = await axios.request(options);
      console.log("ax_ios", response.data.data.instrumentResponse.redirectInfo);
      return res.redirect(
        response.data.data.instrumentResponse.redirectInfo.url
      );
    } catch (error) {
      console.error(error);
    }
  } catch (error) {
    res.status(500).send({
      message: error.message,
      success: false,
    });
  }
};

const checkStatus = async (req, res) => {
  console.log("chack status req:", req.body);
  console.log("chack status res:", res.req.body);

  const merchantTransactionId = res.req.body.transactionId;
  const merchantId = res.req.body.merchantId;

  const keyIndex = 1;
  const string =
    `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
  const sha256 = crypto.createHash("sha256").update(string).digest("hex");
  const checksum = sha256 + "###" + keyIndex;

  const options = {
    method: "GET",
    url: `https://api.phonepe.com/apis/hermes/pg/v1/status/${merchantId}/${merchantTransactionId}`,
    headers: {
      accept: "application/json",
      "Content-Type": "application/json",
      "X-VERIFY": checksum,
      "X-MERCHANT-ID": `${merchantId}`,
    },
  };

  // CHECK PAYMENT STATUS
  axios
    .request(options)
    .then(async (response) => {
      if (response.data.success === true) {
        console.log("chack success:");

        const url = `http://localhost:1234/success`;
        return res.redirect(url);
      } else {
        console.log("chack fail:");

        const url = `http://localhost:1234/failure`;
        return res.redirect(url);
      }
    })
    .catch((error) => {
      console.error(error);
    });
};

export { newPayment, checkStatus };
