import { generateThumbnail } from "../../../../../../utils/generateThumbnailUtils"
import { Thumbnail } from "../../../../../Elements/Thumbnail/Thumbnail"
import { useEffect, useState } from "react"

export const Preview = (props) => {
  const [thumbnails, setThumbnails] = useState([])

  useEffect(() => {
    const generateThumbnails = async () => {
      // Преобразуем каждый файл в асинхронную задачу для создания миниатюры
      const thumbnailPromises = props.files.map(async (file) => {
        if (file.type.startsWith("video/")) {
          const thumbnailURL = await generateThumbnail(file)
          return { file, thumbnailURL }
        }
        return { file, thumbnailURL: null }
      })

      // Ожидаем завершения всех задач и сохраняем результаты
      const thumbnails = await Promise.all(thumbnailPromises)
      setThumbnails(thumbnails) // Обновляем состояние с миниатюрами
    }

    generateThumbnails() // Запускаем генерацию миниатюр при изменении props.files
  }, [props.files])

  return (
    <>
      {thumbnails.map(({ file, thumbnailURL }, index) => (
        <div key={index}>
          {file.type.startsWith("image/") && (
            <img src={URL.createObjectURL(file)} alt="Preview" width={100} />
          )}
          {file.type.startsWith("video/") && thumbnailURL && (
            <Thumbnail local={true} src={URL.createObjectURL(thumbnailURL)} />
          )}
        </div>
      ))}
    </>
  )
}
