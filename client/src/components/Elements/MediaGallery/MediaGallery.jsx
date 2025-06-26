import { useState, useEffect } from "react"
import classNames from "./MediaGallery.module.scss"
import { ShakaVideoPlayer } from "../ShakaVideoPlayer/ShakaVideoPlayer"
import { Blackout } from "../Blackout/Blackout"
import { CustomArrow } from "./CustomArrow/CustomArrow"
import { Close } from "../SVGComponents/SVGComponents" // Импорт кастомных стрелок

export const MediaGallery = (props) => {
  const [currentSlide, setCurrentSlide] = useState(props.initialIndex || 0)
  const [arrowWidth, setArrowWidth] = useState(0)
  const [autoPlay, setAutoPlay] = useState(props.autoPlay || false)

  // Обработчик переключения слайдов через стрелки
  const handleSlideChange = (index) => {
    setCurrentSlide(index)
  }

  // Функция для перехода к предыдущему слайду
  const prevSlide = () => {
    setCurrentSlide((prevSlide) => Math.max(prevSlide - 1, 0))
    if (autoPlay) setAutoPlay(false)
  }

  // Функция для перехода к следующему слайду
  const nextSlide = () => {
    setCurrentSlide((prevSlide) =>
      Math.min(prevSlide + 1, props.media.length - 1),
    )
    if (autoPlay) setAutoPlay(false)
  }

  // Обработчик прокрутки мыши
  const handleWheel = (e) => {
    if (e.deltaY > 0) {
      nextSlide() // Прокрутка вниз — переключение на следующий слайд
    } else {
      prevSlide() // Прокрутка вверх — переключение на предыдущий слайд
    }
  }

  useEffect(() => {
    const arrow = document.getElementById("customArrow")
    if (arrow) {
      setArrowWidth(arrow.offsetWidth) // Устанавливаем ширину стрелки
    }
  }, [])

  // Добавляем обработчик скролла при монтировании компонента
  useEffect(() => {
    const container = document.getElementById("galleryContainer")
    const chats = document.getElementById("chats")
    const messages = document.getElementById("messages")
    if (container) {
      container.addEventListener("wheel", handleWheel)
    }

    // Запрещаем прокрутку для остальной части страницы
    if (chats) chats.style.overflowY = "hidden"
    messages.style.overflowY = "hidden"

    // Убираем обработчик при размонтировании компонента и восстанавливаем прокрутку
    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
      if (chats) chats.style.overflowY = "auto"
      messages.style.overflowY = "auto"
    }
  }, [])

  return (
    <div className={classNames.container} id="galleryContainer">
      <div
        className={classNames.close}
        onClick={() => props.onClose(false)}
        style={{
          width: `${arrowWidth}px`,
          height: `${arrowWidth}px`,
        }}
      >
        <Close />
      </div>
      <div className={classNames.carousel}>
        <CustomArrow
          direction="prev"
          onClick={prevSlide}
          isHidden={currentSlide === 0} // Скрываем стрелку "Назад" на первом слайде
        />

        {/* Отображаем только текущий слайд */}
        {props.media.map((item, index) => {
          if (index === currentSlide) {
            return (
              <div
                key={index}
                className={classNames.slide}
                onClick={() => handleSlideChange(index)} // При клике на слайд меняем активный
              >
                {item.type === "image" ? (
                  <img
                    src={process.env.REACT_APP_SERVER_URL + item.url}
                    alt="Gallery item"
                    style={{ width: "100%" }}
                  />
                ) : (
                  <ShakaVideoPlayer
                    src={process.env.REACT_APP_SERVER_URL + item.url}
                    thumbnail={item.thumbnail}
                    autoPlay={autoPlay}
                  />
                )}
                <span className={classNames.slideCounter}>
                  {currentSlide + 1} / {props.mediaCounter}
                </span>
              </div>
            )
          }
          return null
        })}
        <CustomArrow
          direction="next"
          onClick={nextSlide}
          isHidden={currentSlide === props.mediaCounter - 1} // Скрываем стрелку "Вперед" на последнем слайде
        />
        <Blackout onClick={() => props.onClose(false)} />
      </div>
    </div>
  )
}
