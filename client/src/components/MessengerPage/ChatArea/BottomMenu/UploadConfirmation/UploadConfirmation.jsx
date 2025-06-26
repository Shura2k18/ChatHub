import classNames from "./UploadConfirmation.module.scss"
import { FormContainerComponent } from "../../../../Elements/FormContainerComponent/FormContainerComponent"
import { ButtonComponent } from "../../../../Elements/ButtonComponent/ButtonComponent"
import { sendMessageThunk } from "../../../../../redux/slices/thunks/messagesThunks"
import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { generateThumbnail } from "../../../../../utils/generateThumbnailUtils"
import { Preview } from "./Preview/Preview"

export const UploadConfirmation = (props) => {
  const dispatch = useDispatch()
  const [description, setDescription] = useState()

  // const handleFilesSelected = (selectedFiles) => {
  //   setFiles(selectedFiles)
  // }

  // const determineMessageType = (file) => {
  //   if (file.type.startsWith("image/")) return "image"
  //   if (file.type.startsWith("video/")) return "video"
  //   if (file.type.startsWith("audio/")) return "audio"
  //   return "document"
  // }
  //
  // const sendFile = async (file, lenght) => {
  //   const formData = new FormData()
  //   const messageType = determineMessageType(file)
  //
  //   formData.append("chatroomId", props.chatroomId)
  //   formData.append("messageType", messageType)
  //   formData.append("files", file)
  //   if (lenght === 1 && description) formData.append("content", description)
  //
  //   // if (messageType === "video") {
  //   //   const thumbnailBlob = await generateThumbnail(file)
  //   //   formData.append("files", thumbnailBlob, "thumbnail.jpg")
  //   // }
  //
  //   return dispatch(sendMessageThunk(formData))
  // }
  //
  // const handleConfirm = async (files, description) => {
  //   const progressState = {}
  //   const lenght = files.length
  //   files.forEach((file) => (progressState[file.name] = 0))
  //   props.setUploadProgress(progressState)
  //
  //   for (let file of files) {
  //     await sendFile(file, lenght).then(() => {
  //       props.setUploadProgress((prev) => ({
  //         ...prev,
  //         [file.name]: 100,
  //       }))
  //     })
  //   }
  //
  //   if (files.length > 1 && description) {
  //     await dispatch(
  //       sendMessageThunk({
  //         chatroomId: props.chatroomId,
  //         messageType: "text",
  //         content: description,
  //       }),
  //     )
  //   }
  //   props.setFiles([])
  //   props.setError(null)
  // }
  //
  // useEffect(() => {
  //   for (let file of props.files) {
  //     Object.keys(props.uploadProgress).forEach((fileName) => {
  //       if (props.uploadProgress[fileName] === 100)
  //         props.setUploadProgress((prev) => {
  //           const newProgress = { ...prev }
  //           delete newProgress[fileName]
  //           return newProgress
  //         })
  //     })
  //   }
  // }, [props.uploadProgress])
  useEffect(() => {
    return () => {
      props.setError(null)
    }
  }, [])

  return (
    <FormContainerComponent setIsActive={props.setIsUploadConfirmationActive}>
      {/*<FileUploader onFilesSelected={handleFilesSelected} />*/}
      {/*{files.length > 0 && <FilePreview files={files} onConfirm={handleConfirm} />}*/}
      {/*{props.error ? (*/}
      {/*  <>*/}
      <p className={classNames.error}>{props.error}</p>
      <ButtonComponent
        onClick={() => props.setIsUploadConfirmationActive(false)}
      >
        Закрити
      </ButtonComponent>
      {/*  </>*/}
      {/*) : (*/}
      {/*  <>*/}
      {/*    /!*<Preview files={props.files} />*!/*/}
      {/*    <input*/}
      {/*      type="text"*/}
      {/*      placeholder="Description"*/}
      {/*      onChange={(e) => setDescription(e.target.value)}*/}
      {/*    />*/}

      {/*    <ButtonComponent*/}
      {/*      onClick={() => {*/}
      {/*        handleConfirm(props.files, description)*/}
      {/*      }}*/}
      {/*    >*/}
      {/*      Send*/}
      {/*    </ButtonComponent>*/}
      {/*  </>*/}
      {/*)}*/}
    </FormContainerComponent>
  )
}
