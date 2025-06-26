import classNames from "./Members.module.scss"
import { Member } from "./Member/Member"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

export const Members = (props) => {
  const me = useSelector((state) => state.user.data)
  const onlineStatus = useSelector((state) => state.onlineStatus.data)
  const [sortedMembers, setSortedMembers] = useState([])
  useEffect(() => {
    // Сортируем участников по статусу и по имени
    const sorted = [...props.members].sort((a, b) => {
      // Текущий пользователь всегда на первом месте
      const aUser = a.user ? a.user : a
      const bUser = b.user ? b.user : b

      if (me._id === aUser._id) return -1
      if (me._id === bUser._id) return 1

      // Проверка статуса онлайн
      const aIsOnline = onlineStatus.some(
        (user) => user.userId === aUser._id && user.status === "online",
      )
      const bIsOnline = onlineStatus.some(
        (user) => user.userId === bUser._id && user.status === "online",
      )

      // Онлайн пользователи выше
      if (aIsOnline && !bIsOnline) return -1
      if (!aIsOnline && bIsOnline) return 1

      // Если оба пользователя онлайн/не онлайн, сортируем по имени
      return aUser.name.localeCompare(bUser.name)
    })

    // Обновляем отсортированный список
    setSortedMembers(sorted)
  }, [onlineStatus, props.members, me._id])

  return (
    <div className={classNames.membersContainer}>
      <div className={classNames.members}>
        {sortedMembers.map((member, index) => (
          <Member
            key={index}
            data={props.data}
            setData={props.setData}
            member={member.user ? member.user : member}
            role={member.user && member.role ? member.role : null}
            type={props.type}
          />
        ))}
      </div>
      {/*{isErr ? <p>{t("elements.fieldComponent.err.invalidMembers")}</p> : null}*/}
      {/*<div>*/}
      {/*  <ButtonComponent onClick={() => props.setIsNewGroupActive(false)}>*/}
      {/*    {t("elements.buttonComponent.cansel")}*/}
      {/*  </ButtonComponent>*/}
      {/*  /!*<ButtonComponent onClick={() => sendData()}>*!/*/}
      {/*  <ButtonComponent>{t("elements.buttonComponent.save")}</ButtonComponent>*/}
      {/*</div>*/}
    </div>
  )
}
