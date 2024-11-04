import User from "../models/User.js";

/* READ */
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    res.status(200).json(user);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

export const getUserFriends = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );
    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/* UPDATE */
export const addRemoveFriend = async (req, res) => {
  try {
    const { id, friendId } = req.params;
    const user = await User.findById(id);
    const friend = await User.findById(friendId);

    if (user.friends.includes(friendId)) {
      user.friends = user.friends.filter((id) => id !== friendId);
      friend.friends = friend.friends.filter((id) => id !== id);
    } else {
      user.friends.push(friendId);
      friend.friends.push(id);
    }
    await user.save();
    await friend.save();

    const friends = await Promise.all(
      user.friends.map((id) => User.findById(id))
    );
    const formattedFriends = friends.map(
      ({ _id, firstName, lastName, occupation, location, picturePath }) => {
        return { _id, firstName, lastName, occupation, location, picturePath };
      }
    );

    res.status(200).json(formattedFriends);
  } catch (err) {
    res.status(404).json({ message: err.message });
  }
};

/*UPDATE PROFILE */
export const updateUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email , password, phone, birthday, gender, picturePath } = req.body;

    const updateFields = {};
    if (firstName) updateFields.firstName = firstName;
    if (lastName) updateFields.lastName = lastName;
    if (email) updateFields.email = email;
    if (password) updateFields.password = password; 
    if (phone) updateFields.phone = phone;
    if (birthday) updateFields.birthday = birthday;
    if (gender) updateFields.gender = gender;
    if (picturePath) updateFields.picturePath = picturePath;

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, { new: true });

    // const updatedUser = await User.findByIdAndUpdate(
    //   id,
    //   { phone, birthday, gender },
    //   { new: true } 
    // );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/*SAVE POST */
export const savePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const user = await User.findById(userId);

    if (!user.savedPosts.includes(postId)) {
      user.savedPosts.push(postId);
      await user.save();
      res.status(200).json({ message: "Article saved successfully", savedPosts: user.savedPosts });
    } else {
      res.status(400).json({ message: "Articles were previously saved" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/*UNSAVE POST */
export const unSavePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;
    const user = await User.findById(userId);

    if (user.savedPosts.includes(postId)) {
      user.savedPosts = user.savedPosts.filter((id) => id.toString() !== postId);
      await user.save();
      res.status(200).json({ message: "Post unsaved successfully!", savedPosts: user.savedPosts });
    } else {
      res.status(400).json({ message: "Post not saved" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/*READ SAVE POSTS */
export const getSavedPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate("savedPosts");

    res.status(200).json(user.savedPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



