import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const AdminSafetyPanel = () => {
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("Pending");
  const [selectedReport, setSelectedReport] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchReports();
    fetchStats();
  }, [filter]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${serverUrl}/api/safety/reports?status=${filter}`,
        { withCredentials: true }
      );
      setReports(response.data.reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${serverUrl}/api/safety/reports/stats`,
        { withCredentials: true }
      );
      setStats(response.data.statistics);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleResolveReport = async (reportId, action, notes) => {
    try {
      await axios.put(
        `${serverUrl}/api/safety/report/${reportId}/resolve`,
        {
          status: "Resolved",
          adminAction: action,
          reviewNotes: notes
        },
        { withCredentials: true }
      );
      setActionMessage("Report resolved successfully!");
      setTimeout(() => {
        setSelectedReport(null);
        fetchReports();
        fetchStats();
        setActionMessage("");
      }, 1500);
    } catch (error) {
      setActionMessage("Error resolving report");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🛡️ Safety Dashboard</h1>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-blue-500">{stats.totalReports}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider mt-1">Total Reports</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-red-500">{stats.pendingReports}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider mt-1">Pending Review</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 shadow-lg">
              <div className="text-3xl font-bold text-green-500">{stats.resolvedReports}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wider mt-1">Resolved</div>
            </div>
          </div>
        )}

        {/* Reports by Reason */}
        {stats?.reportsByReason && (
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-6 shadow-lg mb-8">
            <h2 className="text-xl font-bold mb-6 text-gray-100">Reports by Reason</h2>
            <div className="space-y-4">
              {stats.reportsByReason.map((item) => (
                <div key={item._id} className="flex justify-between items-center">
                  <span className="text-gray-300">{item._id}</span>
                  <div className="flex items-center gap-4">
                    <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{
                          width: `${(item.count / stats.totalReports) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="font-bold text-gray-100 min-w-[2rem] text-right">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex flex-wrap gap-3">
          {["Pending", "Under Review", "Resolved", "Dismissed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                filter === status
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Reports List */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
               <p>Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No reports found in this category</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#252525] border-b border-gray-800">
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Video</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reason</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Reported By</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {reports.map((report) => (
                    <tr key={report._id} className="hover:bg-[#252525] transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-200 font-medium">{report.video?.title}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">{report.reason}</td>
                      <td className="px-6 py-4 text-sm text-gray-400">@{report.reportedBy?.username}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          report.status === "Pending" ? "bg-yellow-900/30 text-yellow-500" :
                          report.status === "Resolved" ? "bg-green-900/30 text-green-500" :
                          "bg-gray-800 text-gray-400"
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="text-blue-500 hover:text-blue-400 font-bold underline underline-offset-4"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Report Detail Modal */}
        {selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Review Report</h2>
                <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-white transition">✕</button>
              </div>

              {actionMessage && (
                <div className={`mb-6 p-4 rounded-lg text-sm font-bold ${actionMessage.includes("successfully") ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"}`}>
                  {actionMessage}
                </div>
              )}

              <div className="space-y-4 mb-8 bg-[#0f0f0f] p-4 rounded-lg border border-gray-800">
                <div>
                  <span className="text-xs text-gray-500 uppercase block mb-1">Video Title</span>
                  <span className="text-gray-100 font-medium">{selectedReport.video?.title}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase block mb-1">Reason</span>
                  <span className="text-gray-100">{selectedReport.reason}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase block mb-1">Description</span>
                  <span className="text-gray-300 text-sm italic">{selectedReport.description || "No additional details provided."}</span>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase block mb-1">Reported by</span>
                  <span className="text-blue-400">@{selectedReport.reportedBy?.username}</span>
                </div>
              </div>

              <div className="grid gap-3">
                <button
                  onClick={() => handleResolveReport(selectedReport._id, "Delete", "Content deleted - violates safety policy")}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-red-900/20 transition-all"
                >
                  🗑️ Delete Video
                </button>
                <button
                  onClick={() => handleResolveReport(selectedReport._id, "Age Restrict", "Age restricted - content may not be suitable")}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg shadow-lg shadow-orange-900/20 transition-all"
                >
                  ⚠️ Age Restrict
                </button>
                <button
                  onClick={() => handleResolveReport(selectedReport._id, "None", "Report reviewed - no action needed")}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-all"
                >
                  ✓ Dismiss Report
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSafetyPanel;
