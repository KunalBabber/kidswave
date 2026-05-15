import { useEffect, useState } from "react";
import axios from "axios";

const UseGetAgeAppropriateVideos = (childAge, isEnabled = true) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isEnabled || !childAge) {
      setVideos([]);
      return;
    }

    const fetchAgeAppropriateVideos = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `/api/safety/videos/age-appropriate?limit=20`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
        setVideos(response.data.videos);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching age-appropriate videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAgeAppropriateVideos();
  }, [childAge, isEnabled]);

  return { videos, loading, error };
};

export default UseGetAgeAppropriateVideos;
