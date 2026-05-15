import Report from "../model/reportModel.js";
import BlacklistKeyword from "../model/blacklistKeywordModel.js";
import Video from "../model/videoModel.js";
import User from "../model/userModel.js";
import Channel from "../model/channelModel.js";
import ChildProfile from "../model/ChildProfile.js";

// ===================== REPORT MANAGEMENT =====================

// 📝 Create a new report
export const createReport = async (req, res) => {
  try {
    const { videoId, reason, description } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!videoId || !reason) {
      return res.status(400).json({ message: "Video ID and reason are required" });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    // Check if user already reported this video
    const existingReport = await Report.findOne({
      reportedBy: userId,
      video: videoId,
      status: { $ne: "Dismissed" }
    });

    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this video" });
    }

    // Create new report
    const newReport = await Report.create({
      reportedBy: userId,
      video: videoId,
      reason,
      description: description || ""
    });

    // Increment report count on video
    await Video.findByIdAndUpdate(videoId, { $inc: { reportCount: 1 } });

    return res.status(201).json({
      message: "Report submitted successfully",
      report: newReport
    });
  } catch (error) {
    console.error("Error creating report:", error);
    return res.status(500).json({ message: "Error creating report", error: error.message });
  }
};

// 📋 Get all reports (Admin only)
export const getAllReports = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    // Check if user is admin (you can add admin role to user schema)
    // For now, checking if user exists and has admin privileges
    if (!user) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // Check if user is admin
    if (!user || user.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { status, reason, sortBy = "-createdAt" } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (reason) filter.reason = reason;

    const reports = await Report.find(filter)
      .populate("reportedBy", "username email")
      .populate("video", "title")
      .populate("reviewedBy", "username")
      .sort(sortBy)
      .exec();

    return res.status(200).json({
      message: "Reports retrieved successfully",
      count: reports.length,
      reports
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return res.status(500).json({ message: "Error fetching reports", error: error.message });
  }
};

// ✅ Review and resolve report (Admin only)
export const resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, adminAction, reviewNotes } = req.body;
    const adminId = req.userId;

    if (!adminId) {
      return res.status(401).json({ message: "Admin not authenticated" });
    }

    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update report
    report.status = status || report.status;
    report.adminAction = adminAction || report.adminAction;
    report.reviewNotes = reviewNotes || "";
    report.reviewedBy = adminId;
    report.resolvedAt = status === "Resolved" ? new Date() : null;

    await report.save();

    // Perform admin action on video
    if (adminAction === "Delete") {
      await Video.findByIdAndDelete(report.video);
    } else if (adminAction === "Block Channel") {
      const video = await Video.findById(report.video);
      if (video) {
        await Channel.findByIdAndUpdate(video.channel, { isBlocked: true });
      }
    } else if (adminAction === "Age Restrict") {
      await Video.findByIdAndUpdate(report.video, { ageLimit: 18 });
    }

    return res.status(200).json({
      message: "Report resolved successfully",
      report
    });
  } catch (error) {
    console.error("Error resolving report:", error);
    return res.status(500).json({ message: "Error resolving report", error: error.message });
  }
};

// 📊 Get report statistics (Admin only)
export const getReportStats = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: "Pending" });
    const resolvedReports = await Report.countDocuments({ status: "Resolved" });

    const reportsByReason = await Report.aggregate([
      { $group: { _id: "$reason", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    return res.status(200).json({
      message: "Report statistics retrieved",
      statistics: {
        totalReports,
        pendingReports,
        resolvedReports,
        reportsByReason
      }
    });
  } catch (error) {
    console.error("Error fetching report stats:", error);
    return res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
};

// ===================== AGE-BASED FILTERING =====================

// 🎂 Get age-appropriate videos for a child
export const getAgeAppropriateVideos = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 20, skip = 0 } = req.query;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user?.isChildProfile || user.age === null) {
      return res.status(400).json({ message: "This is not a child profile or age not set" });
    }

    // Get videos where ageLimit <= child's age and video is approved
    const videos = await Video.find({
      ageLimit: { $lte: user.age },
      isApproved: true,
      isBlocked: false
    })
      .populate("channel", "name avatar")
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 })
      .exec();

    const total = await Video.countDocuments({
      ageLimit: { $lte: user.age },
      isApproved: true,
      isBlocked: false
    });

    return res.status(200).json({
      message: "Age-appropriate videos retrieved",
      videos,
      total,
      childAge: user.age
    });
  } catch (error) {
    console.error("Error fetching age-appropriate videos:", error);
    return res.status(500).json({ message: "Error fetching videos", error: error.message });
  }
};

// 🎬 Get videos for a specific child by childId
export const getVideosForChild = async (req, res) => {
  try {
    const { childId } = req.params;

    if (!childId) {
      return res.status(400).json({ message: "Child ID is required" });
    }

    // Fetch child profile to get age
    const childProfile = await ChildProfile.findById(childId);
    if (!childProfile) {
      return res.status(404).json({ message: "Child profile not found" });
    }

    const childAge = childProfile.age;

    // Fetch videos where ageLimit <= child age and isApproved = true
    const videos = await VideoModel.find({
      ageLimit: { $lte: childAge },
      isApproved: true
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Videos retrieved successfully",
      childId,
      childAge,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error("Error fetching videos for child:", error);
    return res.status(500).json({
      message: "Error fetching videos",
      error: error.message
    });
  }
};

// 🆕 Create a new child profile
export const createChildProfile = async (req, res) => {
  try {
    const { name, age } = req.body;
    const parentId = req.userId;

    if (!parentId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!name || !age) {
      return res.status(400).json({ message: "Name and age are required" });
    }

    const newChild = await ChildProfile.create({
      name,
      age,
      parentId
    });

    return res.status(201).json({
      message: "Child profile created successfully",
      child: newChild
    });
  } catch (error) {
    console.error("Error creating child profile:", error);
    return res.status(500).json({ message: "Error creating child profile", error: error.message });
  }
};

// 📋 Get all child profiles for a parent
export const getChildProfiles = async (req, res) => {
  try {
    const parentId = req.userId;

    if (!parentId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const profiles = await ChildProfile.find({ parentId });

    return res.status(200).json({
      message: "Child profiles retrieved",
      profiles
    });
  } catch (error) {
    console.error("Error fetching child profiles:", error);
    return res.status(500).json({ message: "Error fetching child profiles", error: error.message });
  }
};

// 🔄 Switch between parent and child profile
export const switchProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { childId } = req.body; 

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (childId) {
      const childProfile = await ChildProfile.findById(childId);
      if (!childProfile || childProfile.parentId.toString() !== userId) {
        return res.status(404).json({ message: "Child profile not found or unauthorized" });
      }

      user.isChildProfile = true;
      user.age = childProfile.age;
      user.activeChildProfile = childId;
    } else {
      user.isChildProfile = false;
      user.age = null;
      user.activeChildProfile = null;
    }

    await user.save();

    return res.status(200).json({
      message: childId ? "Switched to child profile" : "Switched to parent profile",
      user: {
        id: user._id,
        isChildProfile: user.isChildProfile,
        age: user.age,
        activeChildProfile: user.activeChildProfile
      }
    });
  } catch (error) {
    console.error("Error switching profile:", error);
    return res.status(500).json({ message: "Error switching profile", error: error.message });
  }
};

// ===================== KEYWORD FILTERING =====================

// 🔐 Check if search query contains blacklisted keywords
export const checkBlacklistedKeywords = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Get all active blacklisted keywords
    const blacklistKeywords = await BlacklistKeyword.find({ isActive: true });

    const queryLower = query.toLowerCase();
    const foundKeywords = [];

    blacklistKeywords.forEach(kw => {
      if (queryLower.includes(kw.keyword)) {
        foundKeywords.push({
          keyword: kw.keyword,
          severity: kw.severity,
          category: kw.category
        });
      }
    });

    if (foundKeywords.length > 0) {
      return res.status(400).json({
        message: "Search query contains restricted content",
        isBlocked: true,
        foundKeywords
      });
    }

    return res.status(200).json({
      message: "Search query is safe",
      isBlocked: false
    });
  } catch (error) {
    console.error("Error checking keywords:", error);
    return res.status(500).json({ message: "Error checking keywords", error: error.message });
  }
};

// 🔍 Perform safe search with keyword filtering (POST)
export const performSafeSearch = async (req, res) => {
  try {
    const { searchQuery } = req.body;

    if (!searchQuery) {
      return res.status(400).json({ message: "searchQuery is required" });
    }

    // Check blacklisted keywords
    const blacklistKeywords = await BlacklistKeyword.find({ isActive: true });
    const queryLower = searchQuery.toLowerCase();

    const foundKeywords = blacklistKeywords.filter(kw =>
      queryLower.includes(kw.keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      return res.status(400).json({
        message: "Search query contains blocked content",
        isBlocked: true,
        blockedKeywords: foundKeywords.map(kw => ({
          keyword: kw.keyword,
          severity: kw.severity,
          category: kw.category
        }))
      });
    }

    // Search in videos (title and description) - only approved and not blocked videos
    const videos = await Video.find({
      $and: [
        {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } }
          ]
        },
        { isApproved: true },
        { isBlocked: false }
      ]
    })
      .populate("channel", "name avatar")
      .sort({ views: -1, createdAt: -1 })
      .limit(50); // Limit results for performance

    const total = await Video.countDocuments({
      $and: [
        {
          $or: [
            { title: { $regex: searchQuery, $options: "i" } },
            { description: { $regex: searchQuery, $options: "i" } }
          ]
        },
        { isApproved: true },
        { isBlocked: false }
      ]
    });

    return res.status(200).json({
      message: "Search completed successfully",
      searchQuery,
      isBlocked: false,
      videos,
      total
    });
  } catch (error) {
    console.error("Error performing safe search:", error);
    return res.status(500).json({ message: "Error performing search", error: error.message });
  }
};

// 🔍 Search with keyword filtering
export const safeSearch = async (req, res) => {
  try {
    const { query, limit = 20, skip = 0 } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Check blacklisted keywords
    const blacklistKeywords = await BlacklistKeyword.find({ isActive: true });
    const queryLower = query.toLowerCase();

    const foundKeywords = blacklistKeywords.filter(kw =>
      queryLower.includes(kw.keyword)
    );

    if (foundKeywords.length > 0) {
      return res.status(400).json({
        message: "Search query contains restricted content",
        isBlocked: true,
        foundKeywords
      });
    }

    // Search in videos (title and description)
    const videos = await Video.find({
      $and: [
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
          ]
        },
        { isApproved: true },
        { isBlocked: false }
      ]
    })
      .populate("channel", "name avatar")
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ views: -1 });

    const total = await Video.countDocuments({
      $and: [
        {
          $or: [
            { title: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
          ]
        },
        { isApproved: true },
        { isBlocked: false }
      ]
    });

    return res.status(200).json({
      message: "Search results",
      query,
      videos,
      total
    });
  } catch (error) {
    console.error("Error in safe search:", error);
    return res.status(500).json({ message: "Error in search", error: error.message });
  }
};

// ===================== ADMIN BLACKLIST MANAGEMENT =====================

// ➕ Add keyword to blacklist (Admin only)
export const addBlacklistKeyword = async (req, res) => {
  try {
    const { keyword, severity = "Medium", category = "Other" } = req.body;
    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    if (!keyword) {
      return res.status(400).json({ message: "Keyword is required" });
    }

    // Check if keyword already exists
    const existingKeyword = await BlacklistKeyword.findOne({
      keyword: keyword.toLowerCase()
    });

    if (existingKeyword) {
      return res.status(400).json({ message: "Keyword already exists in blacklist" });
    }

    const newKeyword = await BlacklistKeyword.create({
      keyword: keyword.toLowerCase(),
      severity,
      category,
      addedBy: adminId
    });

    return res.status(201).json({
      message: "Keyword added to blacklist",
      keyword: newKeyword
    });
  } catch (error) {
    console.error("Error adding blacklist keyword:", error);
    return res.status(500).json({ message: "Error adding keyword", error: error.message });
  }
};

// 📋 Get all blacklist keywords (Admin only)
export const getAllBlacklistKeywords = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { category, isActive } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === "true";

    const keywords = await BlacklistKeyword.find(filter)
      .populate("addedBy", "username email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Blacklist keywords retrieved",
      count: keywords.length,
      keywords
    });
  } catch (error) {
    console.error("Error fetching blacklist keywords:", error);
    return res.status(500).json({ message: "Error fetching keywords", error: error.message });
  }
};

// ✏️ Update blacklist keyword (Admin only)
export const updateBlacklistKeyword = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { keywordId } = req.params;
    const { severity, category, isActive } = req.body;

    const keyword = await BlacklistKeyword.findByIdAndUpdate(
      keywordId,
      { severity, category, isActive, updatedAt: new Date() },
      { new: true }
    );

    if (!keyword) {
      return res.status(404).json({ message: "Keyword not found" });
    }

    return res.status(200).json({
      message: "Keyword updated successfully",
      keyword
    });
  } catch (error) {
    console.error("Error updating blacklist keyword:", error);
    return res.status(500).json({ message: "Error updating keyword", error: error.message });
  }
};

// ❌ Delete blacklist keyword (Admin only)
export const deleteBlacklistKeyword = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    const { keywordId } = req.params;

    const keyword = await BlacklistKeyword.findByIdAndDelete(keywordId);

    if (!keyword) {
      return res.status(404).json({ message: "Keyword not found" });
    }

    return res.status(200).json({
      message: "Keyword deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting blacklist keyword:", error);
    return res.status(500).json({ message: "Error deleting keyword", error: error.message });
  }
};

// ===================== VIDEO APPROVAL SYSTEM =====================

// ✅ Approve video (Admin only)
export const approveVideo = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { videoId } = req.params;

    const video = await Video.findByIdAndUpdate(
      videoId,
      { isApproved: true },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res.status(200).json({
      message: "Video approved successfully",
      video
    });
  } catch (error) {
    console.error("Error approving video:", error);
    return res.status(500).json({ message: "Error approving video", error: error.message });
  }
};

// ❌ Reject/Block video (Admin only)
export const blockVideo = async (req, res) => {
  try {
    const adminId = req.userId;
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { videoId } = req.params;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Block reason is required" });
    }

    const video = await Video.findByIdAndUpdate(
      videoId,
      {
        isBlocked: true,
        blockReason: reason,
        isApproved: false
      },
      { new: true }
    );

    if (!video) {
      return res.status(404).json({ message: "Video not found" });
    }

    return res.status(200).json({
      message: "Video blocked successfully",
      video
    });
  } catch (error) {
    console.error("Error blocking video:", error);
    return res.status(500).json({ message: "Error blocking video", error: error.message });
  }
};

// 📊 Get pending approval videos (Admin only)
export const getPendingApprovalVideos = async (req, res) => {
  try {
    const adminId = req.userId;
    console.log(`getPendingApprovalVideos request from User: ${adminId}`);
    
    const admin = await User.findById(adminId);
    console.log(`User found: ${!!admin}, Role: ${admin?.role}`);

    if (!admin || admin.role !== "Admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const { limit = 20, skip = 0 } = req.query;

    const videos = await Video.find({ 
      isApproved: { $ne: true }, 
      isBlocked: false 
    })
      .populate("channel", "name avatar")
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 });

    const total = await Video.countDocuments({
      isApproved: { $ne: true },
      isBlocked: false
    });

    return res.status(200).json({
      message: "Pending approval videos retrieved",
      videos,
      total
    });
  } catch (error) {
    console.error("Error fetching pending videos:", error);
    return res.status(500).json({ message: "Error fetching videos", error: error.message });
  }
};
