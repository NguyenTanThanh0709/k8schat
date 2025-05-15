import { Router } from "express";
import authRoutes from "./auth";
import userRoutes from "./user";
import routerGroup from "./group";
import routerFriend from "./friend";
const rootRouter: Router = Router();


rootRouter.get("/", (req, res) => {
    res.json({
      message: "🦄🌈✨👋🌎🌍🌏✨🌈🦄",
    });
  });

rootRouter.use('/auth', authRoutes);
rootRouter.use('/user', userRoutes);
rootRouter.use('/group', routerGroup);
rootRouter.use('/friend', routerFriend);
export default rootRouter;
