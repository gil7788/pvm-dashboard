import express, { Request, Response, NextFunction } from 'express';
import * as postsService from '../services/postsService';

const router = express.Router();

router.get("/", postsService.getPosts);
router.get("/latest", postsService.getLatestPosts);
router.get("/:id", postsService.getSinglePost);
router.post("/", postsService.addNewPost);
router.patch("/comment/:id", postsService.addCommentToPost);
router.delete("/:id", postsService.deletePostById);

function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err);
  res.status(500).send("Internal Server Error");
}
router.use(errorHandler);

export default router;
