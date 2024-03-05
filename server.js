import express from "express";
import cors from "cors";
const app = express();
const port = 5000;
import phonepeRoute from "./routes/phonepeRoute.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api", phonepeRoute);




app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
