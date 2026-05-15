import React from "react";
import { useNavigate } from "react-router-dom";
  




const VideoCard = ({ thumbnail, duration, channelLogo, title, channelName, views,id }) => {
  const navigate = useNavigate()

  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  return (
    <div className="w-full max-w-[360px] mx-auto cursor-pointer" onClick={()=>navigate(`/watch-video/${id}`)}>
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={thumbnail}
          alt={title}
          className="rounded-xl w-full h-[200px] border-1 border-gray-800 object-cover"
        />
        <span className="absolute bottom-2 right-2 bg-black text-white text-xs px-1 rounded">
          {formatDuration(duration)}
        </span>
      </div>

      {/* Info */}
      <div className="flex mt-3">
        {/* Channel Logo */}
        <img
          src={channelLogo}
          alt={channelName}
          className="w-10 h-10 rounded-full mr-3"
        />

        {/* Text Content */}
        <div>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">
            {title}
          </h3>
          <p className="text-xs text-gray-400 mt-1">{channelName}</p>
          <p className="text-xs text-gray-400">
           {
              Number(views) >= 1_000_000
                ? Math.floor(Number(views) / 1_000_000) + "M"
                : Number(views) >= 1_000
                ? Math.floor(Number(views) / 1_000) + "K"
                : Number(views) || 0
            } views
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;
