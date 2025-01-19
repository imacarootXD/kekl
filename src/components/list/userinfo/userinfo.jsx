import "./userinfo.css";
import { useUserStore } from "../../../lib/userStore";
import { useRef, useEffect } from "react";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { useChatStore } from "../../../lib/chatStore";
import { db } from "../../../lib/firebase";

const UserInfo = () => {
    const{ chatId ,user,isCurrentUserBlocked, isReceivingUserBlocked,changeBlock,resetChat } = useChatStore()
    const handleBlock = async() => {
        if(!user) return;

        const userDocRef = doc(db,"users",currentUser.id)
        try{
            await updateDoc(userDocRef,{
            blocked: isReceivingUserBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
            })
            changeBlock()
        }catch(error){
            console.log(error)
        }
    }
    const { currentUser } = useUserStore();
    const dropdownRef = useRef(null);

    // Close the dropdown menu if the user clicks outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                const dropdowns = document.getElementsByClassName("dropdown-content");
                for (let i = 0; i < dropdowns.length; i++) {
                    const openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains("show")) {
                        openDropdown.classList.remove("show");
                    }
                }
            }
        };

        window.addEventListener("click", handleClickOutside);

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("click", handleClickOutside);
        };
    }, []);

    const toggleDropdown = () => {
        const dropdown = dropdownRef.current.querySelector(".dropdown-content");
        if (dropdown) {
            dropdown.classList.toggle("show");
        }
    };

    return (
        <div className="userinfo">
            <div className="user">
                <img src={currentUser.avatar || "./avatar.png"} alt="" />
                <h2>{currentUser.username}</h2>
            </div>
            <div className="icons">
                <div className="dropdown" ref={dropdownRef}>
                        <img src="./more.png" onClick={toggleDropdown} alt="" />
                    <div id="myDropdown" className="dropdown-content">
                        <button onClick={handleBlock}>
                        {
                            isCurrentUserBlocked
                            ? "you are blocked!"
                            : isReceivingUserBlocked
                            ? "user blocked"
                            : "block user"
                        }</button>
                    </div>
                </div>
                <img src="./video.png" alt="" />
                <img src="./edit.png" alt="" />
            </div>
        </div>
    );
};

export default UserInfo;
