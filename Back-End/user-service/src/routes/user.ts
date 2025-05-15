import { Router, Request, Response, NextFunction } from "express";
import { getUsersByPhone, getPaginatedUsers,getUserFriendsController, getUsersByPhoneLike, updateUserProfile, changeUserPassword, updateUserStatusByPhone } from "../controllers/user";

const router: Router = Router();

router.get('/profile/:phone', (req: Request, res: Response, next: NextFunction) => {
    getUsersByPhone(req, res).catch(next);
});


// ✅ Cập nhật thông tin người dùng theo số điện thoại
router.put('/profile/:phone', (req: Request, res: Response, next: NextFunction) => {
    updateUserProfile(req, res).catch(next)
})

router.patch('/profile/:phone/password', (req: Request, res: Response, next: NextFunction) => {
    changeUserPassword(req, res).catch(next);
});

router.get('/paginate/:phone', (req: Request, res: Response, next: NextFunction) => {
    getPaginatedUsers(req, res).catch(next);
});

router.get('/friend/:phone', (req: Request, res: Response, next: NextFunction) => {
    getUserFriendsController(req, res).catch(next);
});


export default router;