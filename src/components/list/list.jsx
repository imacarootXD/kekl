import "./list.css";
import ChatList from "./chatlist/chatlist";
import UserInfo from "./userinfo/userinfo";

const List = () => {
  return (
    <div className="list">
      <UserInfo />
      <ChatList />
      <button className="logout" onClick={() => auth.signOut()}>
        Logout
      </button>
    </div>
  );
};

export default List;
