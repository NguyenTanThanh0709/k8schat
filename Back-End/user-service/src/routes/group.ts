import { Router, Request, Response, NextFunction } from "express";
import { createGroupController, getUserGroupsController,removeGroupMemberController, getGroupMembersHandler, addMembersToGroupController } from "../controllers/group";

const routerGroup: Router = Router();

routerGroup.post('/group', (req: Request, res: Response, next: NextFunction) => {
    createGroupController(req, res).catch(next);
});

routerGroup.get('/group/:phone', (req: Request, res: Response, next: NextFunction) => {
    getUserGroupsController(req, res).catch(next);
});

routerGroup.get('/group/member/:groupId', (req: Request, res: Response, next: NextFunction) => {
    getGroupMembersHandler(req, res).catch(next);
});

routerGroup.post('/group/member/:groupId', (req: Request, res: Response, next: NextFunction) => {
    addMembersToGroupController(req, res).catch(next);
});

routerGroup.delete('/group/member/:groupId/:userPhone', (req: Request, res: Response, next: NextFunction) => {
    removeGroupMemberController(req, res).catch(next);
});

export default routerGroup;
