import Chat from "./components/chat/chat";
import List from "./components/list/list";
import Detail from "./components/detail/detail";
import Login from "./components/login/login";
import Notification from "./components/notification/notification";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";
import server.js

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId } = useChatStore();
  const [activeTab, setActiveTab] = useState("main"); // Tracks the active tab

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className="loading">Loading</div>;

  if (!currentUser) return <Login />;

  return (
    <div className="container">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "main" ? "active" : ""}`}
          onClick={() => setActiveTab("main")}
        >
          Main
        </button>
        <button
          className={`tab-button ${activeTab === "example" ? "active" : ""}`}
          onClick={() => setActiveTab("example")}
        >
          <server.js />
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "main" && (
          <>
            <div className="list">
              <List />
            </div>
            {chatId && <Chat />}
          </>
        )}
        {activeTab === "example" && <p>This is an example message for another tab.</p>}
      </div>

      <Notification />
    </div>
  );
};

export default App;
