import { dbConnection } from "../../DB/dbConnection.js";
import path from "path";
import { config } from "dotenv";
config({ path: path.resolve("config/.env") });
const port = process.env.PORT || 3001;
import { AppError, globalErrorHandel } from "../utils/globalError.js";

import captainRoutes from "../modules/captain/captain.routes.js";
import childRoutes from "../modules/child/child.routes.js";
import taskRoutes from "../modules/task/task.routes.js";
import assignmentRoutes from "../modules/assignment/assignment.routes.js";


export const initApp = (app, express) => {
  app.use(express.json());

  app.get("/", (req, res, next) => {
    res.status(200).json({ msg: "welcome on our webApp" })
  })
  app.use("/captains", captainRoutes);
  app.use("/childs", childRoutes);
  app.use("/tasks", taskRoutes);
  app.use("/assignments", assignmentRoutes);

  app.all("*", (req, res, next) => {
    next(new AppError(`inValid path ${req.originalUrl}`, 404));
  });

  
  app.use(globalErrorHandel);

  dbConnection();
  app.listen(port, () => console.log(`Example app listening on port ${port}!`));
};
