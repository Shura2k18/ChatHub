import classNames from "./Typing.module.scss"

export const Typing = () => {
  return (
    <div className={classNames.container}>
      <div className={classNames.loader}>
        <div className={`${classNames.circle} ${classNames.item0}`}></div>
        <div className={`${classNames.circle} ${classNames.item1}`}></div>
        <div className={`${classNames.circle} ${classNames.item2}`}></div>
      </div>
      <p>Typing</p>
    </div>
  )
}
