import React, { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Shorts from './pages/Shorts'
import YoutubeSignin from './pages/YoutubeSignin'
import CustomAlert, { showCustomAlert } from './component/CustomAlert'
import CreateAccount from './pages/CreateAccount'
import getCurrentUser from './customHooks/UsegetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import ForgetPassword from './pages/ForgetPassword'
import CreateChannelFlow from './pages/CreateChannelFlow'
import ViewChannel from './pages/ViewChannel'
import UpdateChannel from './pages/UpdateChannel'
import MobileProfile from './pages/MobileProfile'
import UsegetChannel from './customHooks/UsegetChannel'
import CreatePage from './pages/CreatePage'
import CreateVideo from './pages/CreateVideo'
import CreatePost from './pages/CreatePost'
import CreateShorts from './pages/CreateShorts'
import CreatePlaylist from './pages/CreatePlaylist'
import UsegetChannelContent from './customHooks/UsegetChannelContent'
import UsegetAllContent from './customHooks/UsegetAllContentData'
import WatchVideoPage from './pages/WatchVideoPage'
import WatchShortPage from './pages/WatchShortPage'
import ChannelPage from './pages/ChannelPage'
import SubscribePage from './pages/SubscribePage'
import UseGetSubscribedContent from './customHooks/UseGetSubscribedContent'
import SavedPlaylistPage from './pages/SavedPlaylistPage'
import SavedContentPage from './pages/SavedContentPage'
import LikedContentPage from './pages/LikedContentPage'
import ScrollToTop from './component/ScrollToTop'
import HistoryPage from './pages/HistoryPage'
import UseGetHistory from './customHooks/UseGetHistroy'
import PTStudio from './pages/PTStudio'
import Dashboard from './component/Dashboard'
import ContentPage from './component/ContentPage'
import AnalyticsPage from './component/AnalyticsPage'
import ManageVideo from './pages/ManageVideo'
import ManageShort from './pages/ManageShort'
import ManagePlaylist from './pages/ManagePlaylist'
import UseGetRecommendation from './customHooks/UseGetRecommendation'
import RevenuePage from './component/RevenuePage'
import AdminPage from './pages/AdminPage'
import ParentDashboard from './pages/ParentDashboard'

export const serverUrl = "process.env.VITE_SERVER_URL"

const ProtectedRoute = ({ userData, userLoading, children }) => {
  if (userLoading) {
    return <div className="loading-spinner" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#0f0f0f', color: 'white' }}>Loading...</div>;
  }

  if (!userData) {
    showCustomAlert("Please sign up first to use this feature!");
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  getCurrentUser()
  UsegetChannel()
  UsegetChannelContent()
  UsegetAllContent()
  UseGetSubscribedContent()
  UseGetHistory()
  UseGetRecommendation()

  const { userData, userLoading } = useSelector(state => state.user)



  function ChannelPageWrapper() {
    const location = useLocation();
    return <ChannelPage key={location.pathname} />;
  }

  return (
    <>
      <CustomAlert />
      <ScrollToTop />
      <Routes>
        <Route path='/' element={<Home />}>
          <Route path='/shorts' element={<ProtectedRoute userData={userData} userLoading={userLoading}><Shorts /></ProtectedRoute>} />
          <Route path='/viewchannel' element={<ProtectedRoute userData={userData} userLoading={userLoading}><ViewChannel /></ProtectedRoute>} />
          <Route path='/updatechannel' element={<ProtectedRoute userData={userData} userLoading={userLoading}><UpdateChannel /></ProtectedRoute>} />
          <Route path='/mobileprofile' element={<MobileProfile />} />
          <Route path='/createpage' element={<ProtectedRoute userData={userData} userLoading={userLoading}><CreatePage /></ProtectedRoute>} />
          <Route path='/create-video' element={<ProtectedRoute userData={userData} userLoading={userLoading}><CreateVideo /></ProtectedRoute>} />
          <Route path='/create-post' element={<ProtectedRoute userData={userData} userLoading={userLoading}><CreatePost /></ProtectedRoute>} />
          <Route path='/create-short' element={<ProtectedRoute userData={userData} userLoading={userLoading}><CreateShorts /></ProtectedRoute>} />
          <Route path='/create-playlist' element={<ProtectedRoute userData={userData} userLoading={userLoading}><CreatePlaylist /></ProtectedRoute>} />
          <Route path='/watch-short/:shortId' element={<ProtectedRoute userData={userData} userLoading={userLoading}><WatchShortPage /></ProtectedRoute>} />
          <Route path='/channelpage/:channelId' element={<ProtectedRoute userData={userData} userLoading={userLoading}><ChannelPageWrapper /></ProtectedRoute>} />
          <Route path='/subscribepage' element={<ProtectedRoute userData={userData} userLoading={userLoading}><SubscribePage /></ProtectedRoute>} />
          <Route path='/saveplaylist' element={<ProtectedRoute userData={userData} userLoading={userLoading}><SavedPlaylistPage /></ProtectedRoute>} />
          <Route path='/savevideos' element={<ProtectedRoute userData={userData} userLoading={userLoading}><SavedContentPage /></ProtectedRoute>} />
          <Route path='/likedvideos' element={<ProtectedRoute userData={userData} userLoading={userLoading}><LikedContentPage /></ProtectedRoute>} />
          <Route path='/history' element={<ProtectedRoute userData={userData} userLoading={userLoading}><HistoryPage /></ProtectedRoute>} />
          <Route path='/admin' element={<ProtectedRoute userData={userData} userLoading={userLoading}><AdminPage /></ProtectedRoute>} />
          <Route path='/parent-dashboard' element={<ProtectedRoute userData={userData} userLoading={userLoading}><ParentDashboard /></ProtectedRoute>} />



        </Route>

        {/* Routes outside Home */}
        <Route path='/signin' element={<YoutubeSignin />} />
        <Route path='/signup' element={<CreateAccount />} />
        <Route path='/forgetpassword' element={<ForgetPassword />} />
        <Route path='/createchannel' element={<ProtectedRoute userData={userData} userLoading={userLoading}><CreateChannelFlow /></ProtectedRoute>} />
        <Route path='/watch-video/:videoId' element={<ProtectedRoute userData={userData} userLoading={userLoading}><WatchVideoPage /></ProtectedRoute>} />





        <Route path='/ptstudio' element={<ProtectedRoute userData={userData} userLoading={userLoading}><PTStudio /></ProtectedRoute>} >
          <Route path='/ptstudio/dashboard' element={<ProtectedRoute userData={userData} userLoading={userLoading}><Dashboard /></ProtectedRoute>} />
          <Route path='/ptstudio/content' element={<ProtectedRoute userData={userData} userLoading={userLoading}><ContentPage /></ProtectedRoute>} />
          <Route path='/ptstudio/analytics' element={<ProtectedRoute userData={userData} userLoading={userLoading}><AnalyticsPage /></ProtectedRoute>} />
          <Route path='/ptstudio/revenue' element={<ProtectedRoute userData={userData} userLoading={userLoading}><RevenuePage /></ProtectedRoute>} />
          <Route path='/ptstudio/managevideo/:videoId' element={<ProtectedRoute userData={userData} userLoading={userLoading}><ManageVideo /></ProtectedRoute>} />
          <Route path='/ptstudio/manageshort/:shortId' element={<ProtectedRoute userData={userData} userLoading={userLoading}><ManageShort /></ProtectedRoute>} />
          <Route path='/ptstudio/manageplaylist/:playlistId' element={<ProtectedRoute userData={userData} userLoading={userLoading}><ManagePlaylist /></ProtectedRoute>} />
        </Route>





      </Routes>
    </>
  )
}

export default App
