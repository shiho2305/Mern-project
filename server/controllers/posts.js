import Post from "../models/Post.js";
import User from "../models/User.js";
import Comment from "../models/Comments.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const newPost = new Post({
      userId,
      firstName: user.firstName,
      lastName: user.lastName,
      location: user.location,
      description,
      userPicturePath: user.picturePath,
      picturePath,
      likes: {},
      comments: [],
    });
    await newPost.save();

    const post = await Post.find().sort({createdAt: -1});
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
// export const getFeedPosts = async (req, res) => {
//   try {
//     const post = await Post.find().populate('comments').sort({createdAt: -1});
//     res.status(200).json(post);
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };

// export const getUserPosts = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const post = await Post.find({ userId });
//     res.status(200).json(post);
//   } catch (err) {
//     res.status(404).json({ message: err.message });
//   }
// };

export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find()
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'firstName lastName picturePath' },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId })
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'firstName lastName picturePath' },
      })
      .sort({ createdAt: -1 });
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const post = await Post.findById(id);
    const isLiked = post.likes.get(userId);

    if (isLiked) {
      post.likes.delete(userId);
    } else {
      post.likes.set(userId, true);
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { likes: post.likes },
      { new: true }
    );

    res.status(200).json(updatedPost);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};


/* ADD COMMENT */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { userId, content } = req.body;

    const newComment = new Comment({
      userId,
      content,
      createdAt: new Date(),
    });
    await newComment.save();

    const post = await Post.findById(id);
    post.comments.push(newComment._id);
    await post.save();

    const updatedPost = await Post.findById(id)
      .populate({
        path: 'comments',
        populate: { path: 'userId', select: 'firstName lastName picturePath' },
      });

    res.status(201).json(updatedPost);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* DELETE COMMENT */
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; 
    const { userId } = req.body; 

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment does not exist" });
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ message: "You can only delete your own comments" });
    }

    await Comment.findByIdAndDelete(commentId);

    await Post.findByIdAndUpdate(
      id,
      { $pull: { comments: commentId } },
      { new: true }
    );

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* UPDATE COMMENT */
export const editComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; 
    const { content } = req.body;
    
    const comment = await Comment.findById(commentId);
    if (comment) {
      comment.content = content;
      await comment.save();
      
      const post = await Post.findById(id).populate('comments');
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Comment does not exist" });
    }
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* REPLY COMMENT */
export const replyToComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { userId, content, replyTo } = req.body; 

    const newComment = new Comment({
      userId,
      content,
      replyTo,
    });
    await newComment.save();

    const post = await Post.findById(id);
    post.comments.push(newComment._id);
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};



