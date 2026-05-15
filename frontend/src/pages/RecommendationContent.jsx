import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import VideoCard from "../component/VideoCard";
import ShortsCard from "../component/ShortsCard";
import { SiYoutubeshorts } from "react-icons/si";
const RecommendationContent = () => {
  const { recommendationData } = useSelector((state) => state.content);

  // ✅ Combine Recommended + Remaining
  const allVideos = [
    ...(recommendationData?.recommendedVideos || []),
    ...(recommendationData?.remainingVideos || []),
  ];

  const allShorts = [
    ...(recommendationData?.recommendedShorts || []),
    ...(recommendationData?.remainingShorts || []),
  ];

  if (!allVideos.length && !allShorts.length) {
    return null; // Agar kuch bhi data nahi hai
  }

  return (
    <div className="px-6 py-4  mb-[20px]">


      {/* 🔹 Videos Section */}
      {allVideos.length > 0 && (
        <div>
          
          <div className="flex flex-wrap gap-6 mb-12">
            {allVideos.map((video) => (
              <VideoCard
                key={video._id}
                thumbnail={video.thumbnail}
                duration={video.duration}
                channelLogo={video.channel?.avatar}
                title={video.title}
                channelName={video.channel?.name}
                views={`${video.views}`}
                time={new Date(video.createdAt).toLocaleDateString()}
                id={video._id}
              />
            ))}
          </div>
        </div>
      )}

      {/* 🔹 Shorts Section */}
      {allShorts.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-1"><SiYoutubeshorts className="w-6 h-6 text-red-600" />Shorts</h3>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {allShorts.map((short) => (
              <div key={short._id} className="flex-shrink-0">
                <ShortsCard
                  shortUrl={short.shortUrl}
                  title={short.title}
                  channelName={short.channel?.name}
                  views={short.views}
                  id={short._id}
                  avatar={short.channel?.avatar}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationContent;
