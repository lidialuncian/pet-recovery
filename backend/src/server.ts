import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { userRouter, petRouter, clinicRouter, vetRouter, carePlanRouter, carePlanTaskRouter } from "./routes";


dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT;

app.use("/users", userRouter);
app.use("/pets", petRouter);
app.use("/clinics", clinicRouter);
app.use("/vet", vetRouter);
app.use("/care-plans", carePlanRouter);
app.use("/care-plan-tasks", carePlanTaskRouter);
app.listen(PORT, () => {
  console.log(`App is running on http://localhost:${PORT}`);
});