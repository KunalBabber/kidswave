import Video from "../model/videoModel.js";
import Channel from "../model/channelModel.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../model/userModel.js";
import jwt from "jsonwebtoken";


export const createVideo = async (req, res) => {
  try {
    const { title, description, tags, channel, ageLimit } = req.body;

    // Validate required fields
    if (!title || !req.files?.video || !req.files?.thumbnail || !channel) {
      return res.status(400).json({
        message: "Video, thumbnail, title, and channel ID are required"
      });
    }

    // Get channel by ID
    const channelData = await Channel.findById(channel);
    if (!channelData) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Upload video to Cloudinary
    const uploadedVideo = await uploadOnCloudinary(req.files.video[0].path);
    const uploadedThumbnail = await uploadOnCloudinary(req.files.thumbnail[0].path);

    if (!uploadedVideo || !uploadedThumbnail) {
      return res.status(500).json({ message: "Cloudinary upload failed" });
    }

    // Parse tags
    let parsedTags = [];
    if (tags) {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    }

    // Create video with safety fields
    const newVideo = await Video.create({
      channel: channelData._id,
      title,
      description: description || "",
      videoUrl: uploadedVideo.secure_url,
      thumbnail: uploadedThumbnail.secure_url,
      duration: uploadedVideo.duration || 0,
      tags: parsedTags,
      ageLimit: ageLimit || 0,
      isApproved: false, // Require admin approval
      isBlocked: false
    });

    // ✅ Add video to channel's videos array
   await Channel.findByIdAndUpdate(
  channelData._id,
  { $push: { videos: newVideo._id } },
  { new: true } // returns updated doc
);

    // Return updated channel along with new video
   return res.status(201).json({
      message: "Video uploaded successfully. Awaiting admin approval.",
      video: newVideo
    });

  } catch (error) {
    console.error("Error creating video:", error);
   return res.status(500).json({
      message: "Error creating video",
      error: error.message
    });
  }
};




// Get all videos from a channel (for playlist selection)
export const getChannelVideos = async (req, res) => {
  try {
    const { channelId } = req.body;

    if (!channelId) {
      return res.status(400).json({ message: "Channel ID is required" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const videos = await Video.find({ channel: channelId })
      .select("title thumbnail createdAt")
      .sort({ createdAt: -1 });

   return res.status(200).json({ videos });
  } catch (error) {
   return res.status(500).json({
      message: "Error fetching channel videos",
      error: error.message
    });
  }
};


export const getAllVideos = async (req, res) => {
  try {
    let userId = req.userId;
    
    // If isAuth wasn't used, check for token manually to identify the user
    if (!userId && req.cookies?.token) {
      try {
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
        userId = decoded.userId;
      } catch (e) {
        // Token invalid or expired, ignore
      }
    }

    // Base filter: Video must be approved OR belong to any of the current user's channels
    let userChannelIds = [];
    if (userId) {
      const channels = await Channel.find({ owner: userId });
      userChannelIds = channels.map(c => c._id);
    }

    let userRole = 'Guest';
    if (userId) {
      const user = await User.findById(userId);
      if (user) userRole = user.role;
    }

    let query;
    
    // If Admin, show everything that isn't blocked
    if (userRole === 'Admin') {
      query = { isBlocked: false };
    } else {
      // Base filter for Parents/Guests: Approved OR Owned
      query = {
        isBlocked: false,
        $or: [
          { isApproved: true }
        ]
      };

      if (userChannelIds.length > 0) {
        query.$or.push({ channel: { $in: userChannelIds } });
      }

      // If Child Profile, strictly enforce approval and age limit
      if (userId) {
        const user = await User.findById(userId);
        if (user && user.isChildProfile) {
          query = {
            isApproved: true,
            isBlocked: false,
            ageLimit: { $lte: user.age || 0 }
          };
        }
      }
    }

    const videos = await Video.find(query)
      .populate("channel", "name avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    return res.status(500).json({ message: "Failed to fetch videos" });
  }
};


// ---------------- FETCH SINGLE VIDEO ----------------
export const fetchVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId;

    const video = await Video.findById(videoId)
      .populate("channel", "name avatar")
      .populate("likes", "username photoUrl");

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // 🛡️ Safety Guard
    if (userId) {
      const user = await User.findById(userId);
      if (user && user.isChildProfile) {
        if (!video.isApproved || video.isBlocked || (video.ageLimit > user.age)) {
          return res.status(403).json({ message: "This content is restricted for your profile." });
        }
      }
    }

    return res.status(200).json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return res.status(500).json({
      message: "Error fetching video",
      error: error.message,
    });
  }
};



// ---------------- UPDATE VIDEO ----------------

export const updateVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { title, description, tags } = req.body;

    // find video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // update fields if provided
    if (title) video.title = title;
    if (description) video.description = description;

    // parse tags if sent
    if (tags) {
      try {
        video.tags = JSON.parse(tags);
      } catch {
        video.tags = [];
      }
    }

    // ✅ if new thumbnail uploaded (single file)
    if (req.file) {
      const uploadedThumbnail = await uploadOnCloudinary(req.file.path);
      video.thumbnail = uploadedThumbnail;
    }

    await video.save();

    return res.status(200).json({
      message: "Video updated successfully",
      video,
    });
  } catch (error) {
    console.error("Error updating video:", error);
    return res
      .status(500)
      .json({ message: "Error updating video", error: error.message });
  }
};

// ---------------- DELETE VIDEO ----------------
export const deleteVideo = async (req, res) => {
  try {
    const { videoId } = req.params;

    // find video
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // remove video reference from channel
    await Channel.findByIdAndUpdate(video.channel, {
      $pull: { videos: video._id },
    });

    // delete video document
    await Video.findByIdAndDelete(videoId);

    return res.status(200).json({
      message: "Video deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting video:", error);
    return res
      .status(500)
      .json({ message: "Error deleting video", error: error.message });
  }
};



// ---------------- LIKE VIDEO ----------------
export const toggleLikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId; // ✅ auth middleware se aayega

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.likes.includes(userId)) {
      // already liked → remove
      video.likes.pull(userId);
    } else {
      // add like → remove dislike if exists
      video.likes.push(userId);
      video.dislikes.pull(userId);
    }

    await video.save();
   return res.status(200).json(video);
  } catch (error) {
  return  res.status(500).json({ message: "Error toggling like", error: error.message });
  }
};

// ---------------- DISLIKE VIDEO ----------------
export const toggleDislikeVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.dislikes.includes(userId)) {
      video.dislikes.pull(userId);
    } else {
      video.dislikes.push(userId);
      video.likes.pull(userId);
    }

    await video.save();
    return res.status(200).json(video);
  } catch (error) {
    return res.status(500).json({ message: "Error toggling dislike", error: error.message });
  }
};

// ---------------- ADD COMMENT ----------------
export const addComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    // pehle video lao
    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    // comment push karo
    video.comments.push({ author: userId, message });
    await video.save();

    // ✅ ab dobara fetch karo with nested populate
    const populatedVideo = await Video.findById(videoId)
      .populate({
        path: "comments.author",
        select: "username photoUrl email"
      })
      .populate({
        path: "comments.replies.author",
        select: "username photoUrl email"
      });

    return res.status(201).json(populatedVideo);
  } catch (error) {
    return res.status(500).json({ message: "Error adding comment", error: error.message });
  }
};


// ---------------- ADD REPLY ----------------
export const addReply = async (req, res) => {
  try {
    const { videoId, commentId } = req.params;
    const { message } = req.body;
    const userId = req.userId;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    const comment = video.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.replies.push({ author: userId, message });
    await video.save();

    // ✅ again fetch with populate
    const populatedVideo = await Video.findById(videoId)
      .populate({
        path: "comments.author",
        select: "username photoUrl email"
      })
      .populate({
        path: "comments.replies.author",
        select: "username photoUrl email"
      });

    return res.status(201).json(populatedVideo);
  } catch (error) {
    return res.status(500).json({ message: "Error adding reply", error: error.message });
  }
};

// ---------------- ADD VIEW ----------------
export const addView = async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
      videoId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!video) return res.status(404).json({ message: "Video not found" });

   return res.status(200).json(video);
  } catch (error) {
   return res.status(500).json({ message: "Error adding view", error: error.message });
  }
};

// ---------------- TOGGLE SAVE ----------------
export const toggleSaveVideo = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.userId;

    const video = await Video.findById(videoId);
    if (!video) return res.status(404).json({ message: "Video not found" });

    if (video.saveBy.includes(userId)) {
      video.saveBy.pull(userId);
    } else {
      video.saveBy.push(userId);
    }

    await video.save();
   return res.status(200).json(video);
  } catch (error) {
   return res.status(500).json({ message: "Error toggling save", error: error.message });
  }
};


export const getSavedVideos = async (req, res) => {
  try {
    const userId = req.userId; // ✅ Middleware se aa rahi hai
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Find videos jisme userId saveBy array me ho
    const savedVideos = await Video.find({ saveBy: userId })
      .populate("channel", "name avatar") // channel info include karo
      .populate("saveBy", "username");    // optional: dekhna kaun save kar chuka hai

    if (!savedVideos || savedVideos.length === 0) {
      return res.status(404).json({ message: "No saved videos found" });
    }

    res.status(200).json(savedVideos);
  } catch (error) {
    console.error("Error fetching saved videos:", error);
    res.status(500).json({
      message: "Server error while fetching saved videos",
    });
  }
};


// ---------------- Get Liked Videos ----------------
export const getLikedVideos = async (req, res) => {
  try {
    const userId = req.userId; // middleware se aayega
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // Find videos jisme likes me userId hai
    const likedVideos = await Video.find({ likes: userId })
      .populate("channel", "name avatar")
      .populate("likes", "username");

   

    res.status(200).json(likedVideos || []);
  } catch (error) {
    console.error("Error fetching liked videos:", error);
    res.status(500).json({
      message: "Server error while fetching liked videos",
    });
  }
};
