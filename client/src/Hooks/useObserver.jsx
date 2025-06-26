import { useCallback, useEffect, useRef, useState } from "react"

export const useObserver = (deps = []) => {
  const [element, setElement] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useCallback((node) => {
    if (node !== null) {
      setElement(node) // Обновляем элемент
    }
  }, [])

  // const observerCallback = useCallback(([entry]) => {
  //   setIsVisible(entry.isIntersecting)
  // }, [])
  // useEffect(() => {
  //   const observer = new IntersectionObserver(observerCallback, {
  //     root: null,
  //     rootMargin: "0px",
  //     threshold: 1.0, // Полностью видимый элемент
  //   })
  //
  //   if (elementRef.current) observer.observe(elementRef.current)
  //
  //   return () => observer.disconnect()
  // }, [observerCallback])

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     ([entry]) => {
  //       setIsVisible(entry.isIntersecting)
  //     },
  //     {
  //       root: null, // Используем viewport как область наблюдения
  //       rootMargin: "0px",
  //       threshold: 0.1, // Процент видимости, при котором срабатывает событие
  //     },
  //   )
  //
  //   if (elementRef.current) {
  //     observer.observe(elementRef.current)
  //   }
  //
  //   return () => {
  //     if (elementRef.current) {
  //       observer.unobserve(elementRef.current)
  //     }
  //   }
  // }, [...deps])
  useEffect(() => {
    if (!element) {
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting)
      },
      {
        root: null, // Используем viewport как область наблюдения
        rootMargin: "0px",
        threshold: 0.1, // Процент видимости, при котором срабатывает событие
      },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [element])
  return {
    elementRef,
    isVisible,
  }
}
