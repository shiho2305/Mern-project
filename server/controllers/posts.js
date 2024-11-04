import Post from "../models/Post.js";
import User from "../models/User.js";

/* CREATE */
export const createPost = async (req, res) => {
  try {
    const { userId, description, picturePath } = req.body;
    const user = await User.findById(userId);
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

    const post = await Post.find();
    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/* READ */
export const getFeedPosts = async (req, res) => {
  try {
    const post = await Post.find();
    res.status(200).json(post);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const post = await Post.find({ userId });
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


/*ADD COMMENT */
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { userId, content } = req.body;
    const post = await Post.findById(id);

    post.comments.push({ userId, content, createdAt: new Date() });
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};

/*UPDATE COMMENT */
export const editComment = async (req, res) => {
  try {
    const { id, commentId } = req.params; 
    const { content } = req.body;
    const post = await Post.findById(id);

    const comment = post.comments.id(commentId);
    if (comment) {
      comment.content = content;
      await post.save();
      res.status(200).json(post);
    } else {
      res.status(404).json({ message: "Comment does not exist" });
    }
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};


/*REPLY COMMENT */
export const replyToComment = async (req, res) => {
  try {
    const { id } = req.params; 
    const { userId, content, replyTo } = req.body; 
    const post = await Post.findById(id);

    post.comments.push({ userId, content, createdAt: new Date(), replyTo });
    await post.save();

    res.status(201).json(post);
  } catch (err) {
    res.status(409).json({ message: err.message });
  }
};


