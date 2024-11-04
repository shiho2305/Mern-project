import express from "express";
import {
  getUser,
  getUserFriends,
  addRemoveFriend,
  savePost,
  unSavePost,
  getSavedPosts,
  updateUserDetails,
} from "../controllers/users.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

/* READ */
router.get("/:id", verifyToken, getUser);
router.get("/:id/friends", verifyToken, getUserFriends);

/* UPDATE */
router.patch("/:id/:friendId", verifyToken, addRemoveFriend);
router.patch("/:id/updateDetails", verifyToken, updateUserDetails);

/*SAVE POST */
router.patch("/:userId/savePost/:postId", verifyToken, savePost); 
router.patch("/:userId/unSavePost/:postId", verifyToken, unSavePost); 
router.get("/:userId/savedPosts", verifyToken, getSavedPosts);

export default router;
