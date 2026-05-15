import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import VideoCard from "./VideoCard"; // your card component

const AllVideosPage = () => {
  // ✅ Access only the array
  const allVideoData = useSelector(
    (state) => state.content.allVideoData
  ) || [];

  return (
    <div className="flex flex-wrap gap-6 mb-12">
      {allVideoData?.map((video) => (
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
  );
};

export default AllVideosPage;
