import express from "express";
import { authRouter } from "./routes/authRoutes";
import { routeRouter } from "./routes/roleRoutes";
import { communityRouter } from "./routes/communityRoutes";
import { memberRouter } from "./routes/memberRoutes";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send(`
    <h1>Hi! Please follow this link for more information about API routes:</h1>
    <a href="https://documenter.getpostman.com/view/14439156/2s93Jrx5Da#3f8eef19-fe2f-458b-bde7-a7abe9fcefa3" target="_blank" >API Routes Information</a>
  `);
});

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
app.use("/v1/community", communityRouter);
app.use("/v1/member", memberRouter);

app.listen(PORT, () => {
  console.log(`Listening at PORT ${PORT}`);
});
