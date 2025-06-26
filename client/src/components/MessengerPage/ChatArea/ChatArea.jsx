import "./ChatArea.scss"
import { TopMenu } from "./TopMenu/TopMenu"
import { Messages } from "./Messages/Messages"
import { BottomMenu } from "./BottomMenu/BottomMenu"
import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"

export const ChatArea = (props) => {
  const [bottomMenuHeight, setBottomMenuHeight] = useState(70)
  const [text, setText] = useState("")
  const [messageEditing, setMessageEditing] = useState(null)
  const { chatroomId } = useParams()

  useEffect(() => {
    setMessageEditing(null)
  }, [chatroomId])
  return (
    <>
      {!chatroomId ? (
        <div className={"unknown"}>
          <h1>Оберіть чат</h1>
        </div>
      ) : (
        <div className={"chatArea"} id={"chatArea"}>
          <TopMenu
            setIsChatAreaActive={props.setIsChatAreaActive}
            // chatroomId={props.chatroomId}
            // setActiveChat={props.setActiveChat}
          />
          <Messages
            bottomMenuHeight={bottomMenuHeight}
            // chatroomId={props.chatroomId}
            uploadProgress={props.uploadProgress}
            setUploadProgress={props.setUploadProgress}
            abortControllers={props.abortControllers}
            setMessageEditing={setMessageEditing}
            setText={setText}
          />
          <BottomMenu
            setBottomMenuHeight={setBottomMenuHeight}
            // chatroomId={props.chatroomId}
            setUploadProgress={props.setUploadProgress}
            uploadProgress={props.uploadProgress}
            abortControllers={props.abortControllers}
            setMessageEditing={setMessageEditing}
            messageEditing={messageEditing}
            setText={setText}
            text={text}
          />
        </div>
      )}
    </>
  )
}
