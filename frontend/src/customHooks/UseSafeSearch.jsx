import { useEffect, useState } from "react";
import axios from "axios";

const UseSafeSearch = (searchQuery, isEnabled = true) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockedKeywords, setBlockedKeywords] = useState([]);

  useEffect(() => {
    if (!isEnabled || !searchQuery) {
      setResults([]);
      setIsBlocked(false);
      setBlockedKeywords([]);
      return;
    }

    const performSafeSearch = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `/api/safety/search`,
          {
            params: {
              query: searchQuery,
              limit: 20
            },
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        if (response.data.isBlocked) {
          setIsBlocked(true);
          setBlockedKeywords(response.data.foundKeywords || []);
          setResults([]);
        } else {
          setIsBlocked(false);
          setBlockedKeywords([]);
          setResults(response.data.videos || []);
        }
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.isBlocked) {
          // Search contains blacklisted keywords
          setIsBlocked(true);
          setBlockedKeywords(err.response.data.foundKeywords || []);
          setResults([]);
        } else {
          setError(err.message);
          setIsBlocked(false);
          setResults([]);
        }
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      performSafeSearch();
    }, 500); // Debounce search

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, isEnabled]);

  return {
    results,
    loading,
    error,
    isBlocked,
    blockedKeywords
  };
};

export default UseSafeSearch;
