import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import VideoCard from '../component/VideoCard';
import { ClipLoader } from 'react-spinners';

const ChildFeed = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildVideos = async () => {
      try {
        const response = await axios.get(`${serverUrl}/api/safety/videos/age-appropriate`, { withCredentials: true });
        setVideos(response.data.videos);
      } catch (error) {
        console.error("Error fetching child videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChildVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader color="#ff4b2b" size={50} />
      </div>
    );
  }

  return (
    <div className="child-feed px-6 py-4 mb-[20px]">
      <h2 className="text-2xl font-bold mb-8 text-orange-400">✨ Just for You</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
        {videos.map(video => (
          <VideoCard 
            key={video._id} 
            id={video._id}
            thumbnail={video.thumbnail}
            duration={video.duration}
            channelLogo={video.channel?.avatar}
            title={video.title}
            channelName={video.channel?.name}
            views={video.views}
          />
        ))}
        {videos.length === 0 && (
          <p className="col-span-full text-center text-gray-400 py-10">
            No videos found for your age yet. Check back soon!
          </p>
        )}
      </div>
    </div>
  );
};

export default ChildFeed;
