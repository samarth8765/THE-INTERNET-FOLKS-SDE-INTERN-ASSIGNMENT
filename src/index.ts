import express from "express";
import { authRouter } from "./routes/authRoutes";
import { routeRouter } from "./routes/roleRoutes";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get("/health", (req, res) => {
  const check = {
    uptime: process.uptime(),
    messaage: "ok",
    timeStamp: new Date().toISOString(),
  };
  try {
    return res.status(200).json(check);
  } catch (err) {
    check.messaage = "error";
    return res.status(500).json(check);
  }
});

app.use("/v1/auth", authRouter);
app.use("/v1/role", routeRouter);

app.listen(PORT, () => {
  console.log(`Listening at PORT ${PORT}`);
});
