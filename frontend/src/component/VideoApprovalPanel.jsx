import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const VideoApprovalPanel = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [blockReason, setBlockReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchPendingVideos();
  }, []);

  const fetchPendingVideos = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${serverUrl}/api/safety/videos/pending-approval?limit=50`,
        { withCredentials: true }
      );
      setVideos(response.data.videos);
    } catch (error) {
      console.error("Error fetching pending videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveVideo = async (videoId) => {
    try {
      await axios.put(
        `${serverUrl}/api/safety/videos/${videoId}/approve`,
        {},
        { withCredentials: true }
      );
      setMessage("✅ Video approved successfully!");
      setTimeout(() => {
        setSelectedVideo(null);
        fetchPendingVideos();
        setMessage("");
      }, 1500);
    } catch (error) {
      setMessage("❌ Error approving video");
    }
  };

  const handleBlockVideo = async (videoId) => {
    if (!blockReason) {
      setMessage("⚠️ Please provide a reason for blocking");
      return;
    }

    try {
      await axios.put(
        `${serverUrl}/api/safety/videos/${videoId}/block`,
        { reason: blockReason },
        { withCredentials: true }
      );
      setMessage("🚫 Video blocked successfully!");
      setBlockReason("");
      setTimeout(() => {
        setSelectedVideo(null);
        fetchPendingVideos();
        setMessage("");
      }, 1500);
    } catch (error) {
      setMessage("❌ Error blocking video");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">✅ Video Approval Panel</h1>
        <p className="text-gray-400 mb-8">Review and approve videos before they appear on KidWave</p>

        {/* Stats */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 shadow mb-8">
          <div className="text-2xl font-bold text-blue-500">{videos.length} Pending Videos</div>
          <p className="text-gray-400">Awaiting review and approval</p>
        </div>

        {/* Videos Grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading pending videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No pending videos! All caught up.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <div
                key={video._id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-lg shadow overflow-hidden hover:shadow-xl transition cursor-pointer"
                onClick={() => setSelectedVideo(video)}
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-40 object-cover opacity-80 hover:opacity-100 transition"
                />
                <div className="p-4">
                  <h3 className="font-bold text-gray-100 mb-2 line-clamp-2">{video.title}</h3>
                  <p className="text-sm text-gray-400 mb-3">
                    Channel: {video.channel?.name}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApproveVideo(video._id);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm transition"
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVideo(video);
                      }}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-1 px-2 rounded text-sm transition"
                    >
                      ✕ Review
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedVideo && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto text-white">
              <div className="sticky top-0 bg-[#252525] p-6 border-b border-gray-800 flex justify-between items-center">
                <h2 className="text-2xl font-bold">Review Video</h2>
                <button
                  onClick={() => {
                    setSelectedVideo(null);
                    setBlockReason("");
                    setMessage("");
                  }}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="p-6">
                {message && (
                  <div className={`mb-4 p-3 rounded text-sm font-semibold ${
                    message.includes("successfully") ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"
                  }`}>
                    {message}
                  </div>
                )}

                {/* Thumbnail */}
                <img
                  src={selectedVideo.thumbnail}
                  alt={selectedVideo.title}
                  className="w-full h-64 object-cover rounded-lg mb-4 border border-gray-800"
                />

                {/* Video Info */}
                <div className="space-y-4 mb-6">
                  <div>
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">Title</h3>
                    <p className="text-gray-100 text-lg">{selectedVideo.title}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">Channel</h3>
                    <p className="text-gray-100">{selectedVideo.channel?.name}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">Description</h3>
                    <p className="text-gray-300 text-sm">{selectedVideo.description}</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">Age Limit</h3>
                    <p className="text-orange-400 font-bold">{selectedVideo.ageLimit} years+</p>
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-400 text-xs uppercase tracking-wider mb-1">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVideo.tags?.map((tag) => (
                        <span key={tag} className="bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-1 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Block Reason */}
                <div className="mb-6">
                  <label className="block font-bold text-gray-400 text-xs uppercase tracking-wider mb-2">
                    Block Reason (if rejecting)
                  </label>
                  <textarea
                    value={blockReason}
                    onChange={(e) => setBlockReason(e.target.value)}
                    placeholder="Explain why this video should be blocked..."
                    rows="3"
                    className="w-full bg-[#0f0f0f] border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleApproveVideo(selectedVideo._id)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => handleBlockVideo(selectedVideo._id)}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition"
                  >
                    🚫 Block
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoApprovalPanel;
