
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useEffect, useRef, useState } from "react";

// The entire application is now inside this single App component.
function MentorConnect() {
  // State variables to manage the call
  const [roomID, setRoomID] = useState("");
  const [userName, setUserName] = useState("");
  const [isInCall, setIsInCall] = useState(false);
  const [error, setError] = useState("");

  // Refs to hold the meeting container and Zego instance
  const meetingContainerRef = useRef(null);
  const zpRef = useRef(null);

  // Your Zego Cloud credentials - IMPORTANT: Move to a server in production!
  const appID = 1869529190;
  const serverSecret = "31bee891064d7d7722aea8922139a47d";

  /**
   * Generates a unique user ID based on the current timestamp.
   */
  const generateUserID = () => {
    return Date.now().toString();
  };

  /**
   * Generates a temporary Kit Token for testing purposes.
   * WARNING: In a real application, this MUST be done on a secure backend server.
   */
  const generateKitToken = (userID, roomID) => {
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      userName || `User_${userID}`
    );
    return kitToken;
  };

  /**
   * Handles the logic for joining a video call.
   */
  const joinCall = async () => {
    // Basic validation for room ID and user name
    if (!roomID.trim()) {
      setError("Please enter a room ID");
      return;
    }
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }

    setError("");
    const userID = generateUserID();
    const kitToken = generateKitToken(userID, roomID);

    try {
      // Create a Zego UI Kit instance
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zpRef.current = zp;

      // Join the room with specified configurations
      zp.joinRoom({
        container: meetingContainerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: true,
        turnOnCameraWhenJoining: true,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 50, // Increased max users
        layout: "Grid",
        showLayoutButton: true,
        onJoinRoom: () => {
          console.log("Joined room successfully");
          setIsInCall(true); // Switch to the in-call view
        },
        onLeaveRoom: () => {
          console.log("Left room");
          setIsInCall(false); // Switch back to the lobby view
        },
        onUserJoin: (users) => {
          console.log("User joined:", users);
        },
        onUserLeave: (users) => {
          console.log("User left:", users);
        },
      });
    } catch (err) {
      console.error("Error joining call:", err);
      setError("Failed to join the call. Please try again.");
    }
  };

  /**
   * Handles leaving the video call.
   */
  const leaveCall = () => {
    if (zpRef.current) {
      zpRef.current.destroy(); // Clean up the Zego instance
      zpRef.current = null;
    }
    setIsInCall(false);
  };

  /**
   * Generates a random string for the Room ID.
   */
  const generateRandomRoomID = () => {
    const randomID = Math.floor(Math.random() * 100000).toString();
    setRoomID(randomID);
  };

  // Effect to clean up the Zego instance when the component is unmounted
  useEffect(() => {
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
      }
    };
  }, []);

  // Conditional Rendering:
  // If we are in a call, render the meeting UI.
  // Otherwise, render the lobby/pre-join UI.

  if (isInCall) {
    return (
      <div className="w-full h-screen bg-gray-900 relative">
        {/* Leave call button is always visible during the call */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={leaveCall}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-semibold shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Leave Call
          </button>
        </div>

        {/* This div is where the Zego video call UI will be rendered */}
        <div ref={meetingContainerRef} className="w-full h-full" />
      </div>
    );
  }

  // This is the Lobby / Pre-join screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      {/* Main container with modern card design */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
        {/* Decorative background gradient */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10 rounded-t-3xl"></div>

        {/* Header section */}
        <div className="text-center mb-8 relative z-10">
          <div className="relative mx-auto mb-6 w-24 h-24">
            {/* Animated rings around icon */}
            <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
            <div className="absolute inset-2 bg-purple-500 rounded-full animate-pulse opacity-30"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center w-full h-full shadow-xl">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Video Conference
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Connect with your team instantly
          </p>
        </div>

        {/* Error message display */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mb-6 shadow-sm">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {/* Form inputs */}
        <div className="space-y-6">
          {/* Name input */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
              <svg
                className="w-5 h-5 mr-2 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Your Display Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:border-gray-300"
            />
          </div>

          {/* Room ID input */}
          <div>
            <label className="flex items-center text-sm font-bold text-gray-700 mb-3">
              <svg
                className="w-5 h-5 mr-2 text-purple-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              Room ID
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={roomID}
                onChange={(e) => setRoomID(e.target.value)}
                placeholder="Enter room ID"
                className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none transition-all duration-300 text-gray-800 placeholder-gray-400 shadow-sm hover:border-gray-300"
              />
              <button
                onClick={generateRandomRoomID}
                className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 border-2 border-gray-200 hover:border-gray-300"
                title="Generate random room ID"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Join button */}
          <button
            onClick={joinCall}
            disabled={!roomID.trim() || !userName.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white py-5 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:transform-none disabled:shadow-none flex items-center justify-center gap-3 shadow-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {!roomID.trim() || !userName.trim()
              ? "Fill in Details Above"
              : "Start Video Conference"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default MentorConnect;
