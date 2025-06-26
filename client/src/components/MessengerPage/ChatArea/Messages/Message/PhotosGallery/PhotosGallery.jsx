import classNames from "./PhotosGallery.module.scss"
import { useEffect, useRef, useState } from "react"

export const PhotosGallery = (props) => {
  const containerRef = useRef(null)
  const [sortedImages, setSortedImages] = useState([])

  useEffect(() => {
    const loadImages = async () => {
      const categorizedImages = await Promise.all(
        props.images.map((src) => {
          return new Promise((resolve) => {
            const img = new Image()
            img.src = src
            img.onload = () => {
              resolve({
                src,
                width: img.width,
                height: img.height,
                landscape: img.width > img.height,
              })
            }
          })
        }),
      )

      setSortedImages(categorizedImages)
    }

    loadImages()
  }, [props.images])

  const renderGallery = () => {
    const items = []
    let index = 0
    let landscapeCount = sortedImages.filter((img) => img.landscape).length
    let portraitCount = sortedImages.length - landscapeCount

    for (let i = 0; i < sortedImages.length; i++) {
      const image = sortedImages[i]

      if (sortedImages.length % 2 === 0) {
        // Если фото четное — все в 2 колонки
        items.push(
          <div key={index} className={classNames.galleryItem}>
            <img src={image.src} alt={`image-${index}`} />
          </div>,
        )
      } else {
        // Если фото нечетное
        if (landscapeCount > portraitCount) {
          if (i === 0) {
            // Первое фото горизонтальное на всю ширину
            items.push(
              <div key={index} className={classNames.galleryItemSingle}>
                <img src={image.src} alt={`image-${index}`} />
              </div>,
            )
          } else {
            items.push(
              <div key={index} className={classNames.galleryItem}>
                <img src={image.src} alt={`image-${index}`} />
              </div>,
            )
          }
        } else {
          if (i === 0) {
            // Первое фото вертикальное на 2 ряда
            items.push(
              <div key={index} className={classNames.galleryItemTall}>
                <img src={image.src} alt={`image-${index}`} />
              </div>,
            )
          } else {
            items.push(
              <div key={index} className={classNames.galleryItem}>
                <img src={image.src} alt={`image-${index}`} />
              </div>,
            )
          }
        }
      }
      index++
    }

    return items
  }

  return (
    <div ref={containerRef} className={classNames.galleryContainer}>
      <div className={classNames.gallery}>{renderGallery()}</div>
    </div>
  )
}
