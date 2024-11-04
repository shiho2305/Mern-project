import express from "express";
import { addComment, editComment, getFeedPosts, getUserPosts, likePost, replyToComment } from "../controllers/posts.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/", verifyToken, getFeedPosts);
router.get("/:userId/posts", verifyToken, getUserPosts);

/* UPDATE */
router.patch("/:id/like", verifyToken, likePost);

/*COMMENT */
router.post("/:id/comments", verifyToken, addComment); 
router.patch("/:id/comments/:commentId", verifyToken, editComment); 
router.post("/:id/comments/:commentId/reply", verifyToken, replyToComment);

export default router;
