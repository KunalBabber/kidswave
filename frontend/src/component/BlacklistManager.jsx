import React, { useState, useEffect } from "react";
import axios from "axios";
import { serverUrl } from "../App";

const BlacklistManager = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newSeverity, setNewSeverity] = useState("Medium");
  const [newCategory, setNewCategory] = useState("Other");
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    fetchKeywords();
  }, [filter]);

  const fetchKeywords = async () => {
    setLoading(true);
    try {
      const params = filter !== "All" ? { category: filter } : {};
      const response = await axios.get(
        `${serverUrl}/api/safety/blacklist`,
        {
          params,
          withCredentials: true
        }
      );
      setKeywords(response.data.keywords);
    } catch (error) {
      console.error("Error fetching keywords:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddKeyword = async (e) => {
    e.preventDefault();

    if (!newKeyword.trim()) {
      setMessage("⚠️ Please enter a keyword");
      return;
    }

    try {
      const response = await axios.post(
        `${serverUrl}/api/safety/blacklist`,
        {
          keyword: newKeyword,
          severity: newSeverity,
          category: newCategory
        },
        { withCredentials: true }
      );
      setMessage("✅ Keyword added successfully!");
      setNewKeyword("");
      setNewSeverity("Medium");
      setNewCategory("Other");
      setTimeout(() => {
        fetchKeywords();
        setMessage("");
      }, 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || "❌ Error adding keyword");
    }
  };

  const handleDeleteKeyword = async (keywordId) => {
    if (!window.confirm("Are you sure you want to delete this keyword?")) return;

    try {
      await axios.delete(
        `${serverUrl}/api/safety/blacklist/${keywordId}`,
        { withCredentials: true }
      );
      setMessage("✅ Keyword deleted successfully!");
      setTimeout(() => {
        fetchKeywords();
        setMessage("");
      }, 1000);
    } catch (error) {
      setMessage("❌ Error deleting keyword");
    }
  };

  const categories = [
    "Violence",
    "Hate Speech",
    "Sexual",
    "Drugs",
    "Scam",
    "Misinformation",
    "Other"
  ];

  const severityLevels = ["Low", "Medium", "High", "Critical"];

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">🚫 Keyword Blacklist Manager</h1>
        <p className="text-gray-400 mb-8">Control which keywords are blocked from search results</p>

        {message && (
          <div className={`mb-6 p-4 rounded-lg font-semibold ${
            message.includes("successfully") ? "bg-green-900/30 text-green-400 border border-green-800" : "bg-red-900/30 text-red-400 border border-red-800"
          }`}>
            {message}
          </div>
        )}

        {/* Add New Keyword */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-6 text-gray-100">➕ Add New Keyword</h2>
          <form onSubmit={handleAddKeyword} className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              placeholder="Enter keyword"
              className="bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={newSeverity}
              onChange={(e) => setNewSeverity(e.target.value)}
              className="bg-[#0f0f0f] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {severityLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg col-span-1 md:col-span-2 shadow-lg shadow-blue-900/20 transition-all"
            >
              Add Keyword
            </button>
          </form>
        </div>

        {/* Category Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("All")}
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              filter === "All"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                : "bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-white"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                filter === cat
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/20"
                  : "bg-[#1a1a1a] text-gray-400 border border-gray-800 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Keywords List */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500">
               <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
               <p>Loading keywords...</p>
            </div>
          ) : keywords.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No keywords found in this category</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#252525] border-b border-gray-800 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Keyword</th>
                    <th className="px-6 py-4 text-left">Category</th>
                    <th className="px-6 py-4 text-left">Severity</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Added By</th>
                    <th className="px-6 py-4 text-left">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {keywords.map((keyword) => (
                    <tr key={keyword._id} className="hover:bg-[#252525] transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-400">{keyword.keyword}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-blue-900/30 text-blue-400 border border-blue-800 px-2 py-1 rounded text-xs font-bold">
                          {keyword.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          keyword.severity === "Critical" ? "bg-red-900/30 text-red-500" :
                          keyword.severity === "High" ? "bg-orange-900/30 text-orange-500" :
                          keyword.severity === "Medium" ? "bg-yellow-900/30 text-yellow-500" :
                          "bg-green-900/30 text-green-500"
                        }`}>
                          {keyword.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          keyword.isActive
                            ? "bg-green-900/30 text-green-500"
                            : "bg-gray-800 text-gray-500"
                        }`}>
                          {keyword.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">@{keyword.addedBy?.username || "System"}</td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleDeleteKeyword(keyword._id)}
                          className="text-red-500 hover:text-red-400 font-bold underline underline-offset-4"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Card */}
        <div className="mt-8 p-8 bg-[#1a1a1a] border border-blue-900/30 rounded-xl border-l-4 border-l-blue-600 shadow-lg">
          <h3 className="font-bold text-blue-400 text-lg mb-3 flex items-center gap-2">💡 How Keyword Filtering Works</h3>
          <ul className="text-sm text-gray-400 space-y-2">
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">✓</span> All search queries are checked against active blacklist keywords.</li>
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">✓</span> Matches are blocked from returning in search results.</li>
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">✓</span> Severity levels help prioritize high-risk keywords for the safety engine.</li>
            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">✓</span> Categories help organize and manage safety policies across the platform.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default BlacklistManager;
