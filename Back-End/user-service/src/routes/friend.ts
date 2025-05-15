import { Router, Request, Response, NextFunction } from "express";
import { sendFriendRequestController, unfriendUserController } from "../controllers/friend";

const routerFriend: Router = Router();

routerFriend.post('/friend', (req: Request, res: Response, next: NextFunction) => {
    sendFriendRequestController(req, res).catch(next);
});

routerFriend.post('/unfriend', (req: Request, res: Response, next: NextFunction) => {
    unfriendUserController(req, res).catch(next);
});



export default routerFriend;
