import express from "express";
import isAuth from "../middleware/isAuth.js";
import {
  // Report Management
  createReport,
  getAllReports,
  resolveReport,
  getReportStats,
  // Age-based Filtering
  getAgeAppropriateVideos,
  getVideosForChild,
  // Keyword Filtering
  checkBlacklistedKeywords,
  safeSearch,
  performSafeSearch,
  // Blacklist Management
  addBlacklistKeyword,
  getAllBlacklistKeywords,
  updateBlacklistKeyword,
  deleteBlacklistKeyword,
  // Video Approval
  approveVideo,
  blockVideo,
  getPendingApprovalVideos,
  // Child Profile Management
  createChildProfile,
  getChildProfiles,
  switchProfile
} from "../controller/safetyController.js";

const safetyRouter = express.Router();

// ==================== REPORT ROUTES ====================

// Create a new report
safetyRouter.post("/report", isAuth, createReport);

// Get all reports (Admin)
safetyRouter.get("/reports", isAuth, getAllReports);

// Resolve/Review a report (Admin)
safetyRouter.put("/report/:reportId/resolve", isAuth, resolveReport);

// Get report statistics (Admin)
safetyRouter.get("/reports/stats", isAuth, getReportStats);

// ==================== VIDEO APPROVAL ROUTES ====================

// Get pending approval videos (Admin)
safetyRouter.get("/videos/pending-approval", isAuth, getPendingApprovalVideos);

// Approve a video (Admin)
safetyRouter.put("/videos/:videoId/approve", isAuth, approveVideo);

// Block a video (Admin)
safetyRouter.put("/videos/:videoId/block", isAuth, blockVideo);

// ==================== CHILD PROFILE MANAGEMENT ====================

// Create a new child profile
safetyRouter.post("/profile/child", isAuth, createChildProfile);

// Get all child profiles for parent
safetyRouter.get("/profiles/child", isAuth, getChildProfiles);

// Switch between parent and child profile
safetyRouter.post("/profile/switch", isAuth, switchProfile);

// ==================== KEYWORD FILTERING ROUTES ====================

// Check if search query is safe
safetyRouter.post("/search/check-keywords", isAuth, checkBlacklistedKeywords);

// Perform safe search with keyword filtering
safetyRouter.post("/search", performSafeSearch);

// Safe search with keyword filtering (GET version)
safetyRouter.get("/search", isAuth, safeSearch);

// ==================== BLACKLIST MANAGEMENT ROUTES ====================

// Add keyword to blacklist (Admin)
safetyRouter.post("/blacklist", isAuth, addBlacklistKeyword);

// Get all blacklist keywords (Admin)
safetyRouter.get("/blacklist", isAuth, getAllBlacklistKeywords);

// Update blacklist keyword (Admin)
safetyRouter.put("/blacklist/:keywordId", isAuth, updateBlacklistKeyword);

// Delete blacklist keyword (Admin)
safetyRouter.delete("/blacklist/:keywordId", isAuth, deleteBlacklistKeyword);

// ==================== AGE-FILTERING ROUTES ====================

// Get age-appropriate videos for child profile
safetyRouter.get("/videos/age-appropriate", isAuth, getAgeAppropriateVideos);

// Get videos for a specific child by childId
safetyRouter.get("/videos/:childId", getVideosForChild);

export default safetyRouter;
