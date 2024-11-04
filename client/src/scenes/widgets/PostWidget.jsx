import {
  ChatBubbleOutlineOutlined,
  FavoriteBorderOutlined,
  FavoriteOutlined,
  ShareOutlined,
} from "@mui/icons-material";
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Box, Divider, IconButton, Typography, useTheme, TextField, Button,Avatar} from "@mui/material";
import FlexBetween from "components/FlexBetween";
import Friend from "components/Friend";
import WidgetWrapper from "components/WidgetWrapper";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPost } from "state";

const PostWidget = ({
  postId,
  postUserId,
  name,
  description,
  location,
  picturePath,
  userPicturePath,
  likes,
  comments = [],
}) => {
  const [isComments, setIsComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [localComments, setLocalComments] = useState(comments);
  
  const dispatch = useDispatch();
  const token = useSelector((state) => state.token);
  const loggedInUserId = useSelector((state) => state.user._id);
  const isLiked = Boolean(likes[loggedInUserId]);
  const likeCount = Object.keys(likes).length;
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const { palette } = useTheme();
  const main = palette.neutral.main;
  const primary = palette.primary.main;

  const patchLike = async () => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/like`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
    const updatedPost = await response.json();
    dispatch(setPost({ post: updatedPost }));
  };

  // Function to handle adding a new comment
  const handleAddComment = async () => {
    if (newComment.trim() === "") return; // Kiểm tra nếu comment không rỗng

    const response = await fetch(`http://localhost:3001/posts/${postId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId, content: newComment }),
    });

    if (response.ok) {
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost }));
      setLocalComments(updatedPost.comments);
      setNewComment(""); // Reset input sau khi thêm comment
    } else {
      console.error("Failed to add comment");
    }
  };

  // Function to initiate editing a comment
  const handleEditComment = (commentId, currentContent) => {
    setEditingCommentId(commentId);
    setEditedContent(currentContent);
  };

  // Function to save edited comment
  const handleSaveEdit = async (commentId) => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/comments/${commentId}`, {
      method: "PATCH", 
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: editedContent }),
    });

    if (response.ok) {
      const updatedPost = await response.json();
      dispatch(setPost({ post: updatedPost })); 

      setLocalComments(updatedPost.comments); 
      setEditingCommentId(null);
      setEditedContent("");
    } else {
      console.error("Failed to update comment");
    }
  };

  // Function to handle deleting a comment
  const handleDeleteComment = async (commentId) => {
    const response = await fetch(`http://localhost:3001/posts/${postId}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: loggedInUserId }),
    });
  
    if (response.ok) {
      setLocalComments((prevComments) => prevComments.filter(comment => comment._id !== commentId));
    } else {
      console.error("Failed to delete comment");
    }
  };

  return (
    <WidgetWrapper m="2rem 0">
      <Friend
        friendId={postUserId}
        name={name}
        subtitle={location}
        userPicturePath={userPicturePath}
      />
      <Typography color={main} sx={{ mt: "1rem" }}>
        {description}
      </Typography>
      {picturePath && (
        <img
          width="100%"
          height="auto"
          alt="post"
          style={{ borderRadius: "0.75rem", marginTop: "0.75rem" }}
          src={`http://localhost:3001/assets/${picturePath}`}
        />
      )}
      <FlexBetween mt="0.25rem">
        <FlexBetween gap="1rem">
          <FlexBetween gap="0.3rem">
            <IconButton onClick={patchLike}>
              {isLiked ? (
                <FavoriteOutlined sx={{ color: primary }} />
              ) : (
                <FavoriteBorderOutlined />
              )}
            </IconButton>
            <Typography>{likeCount}</Typography>
          </FlexBetween>

          <FlexBetween gap="0.3rem">
            <IconButton onClick={() => setIsComments(!isComments)}>
              <ChatBubbleOutlineOutlined />
            </IconButton>
            <Typography>{comments?.length}</Typography>
          </FlexBetween>
        </FlexBetween>

        <IconButton>
          <ShareOutlined />
        </IconButton>
      </FlexBetween>
      {isComments && (
        <Box mt="0.5rem">
          <Box display="flex" alignItems="center" mt="0.5rem">
            <IconButton>
              <AccountCircleIcon fontSize="large" />
            </IconButton>
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ borderRadius: "60px" }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleAddComment} 
              sx={{ ml: "0.5rem" }}
            >
              Post
            </Button>
          </Box>
          
          {localComments.map((comment) => (
            <Box key={comment._id} mt="1rem" display="flex" alignItems="start">
              <Avatar
                src={comment.userPicturePath}
                alt={comment.userName}
                sx={{ width: 40, height: 40, mr: 2 }}
              />
              <Box flex={1}>
                <Typography variant="body2" fontWeight="bold">
                  {comment.userName}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {new Date(comment.createdAt).toLocaleString()}
                </Typography>
                {editingCommentId === comment._id ? (
                  <TextField
                    fullWidth
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    variant="outlined"
                    size="small"
                    sx={{ marginTop: "0.5rem" }}
                  />
                ) : (
                  <Typography variant="body2" sx={{ marginTop: "0.5rem" }}>
                    {comment.content}
                  </Typography>
                )}
                <Button
                  onClick={() =>
                    editingCommentId === comment._id
                      ? handleSaveEdit(comment._id)
                      : handleEditComment(comment._id, comment.content)
                  }
                  variant="contained"
                  color="primary"
                  size="small"
                  sx={{ marginTop: "0.5rem" }}
                >
                  {editingCommentId === comment._id ? "Save" : "Edit"}
                </Button>
                {comment.userId === loggedInUserId && ( 
                  <Button
                    onClick={() => handleDeleteComment(comment._id)}
                    variant="contained"
                    color="secondary"
                    size="small"
                    sx={{ marginLeft: "0.5rem", marginTop: "0.5rem" }}
                  >
                    Delete
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </WidgetWrapper>
  );
};

export default PostWidget;
