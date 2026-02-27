import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter } from "./routes";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.use("/users", userRouter);

app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});