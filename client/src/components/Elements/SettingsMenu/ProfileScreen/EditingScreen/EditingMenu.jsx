import "./EditingMenu.scss"
import NewName from "./NewName/NewName"
import NewNumber from "./NewNumber/NewNumber"
import NewTag from "./NewTag/NewTag"
import NewPassword from "./NewPassword/NewPassword"
import { FieldNotification } from "../../../FieldNotification/FieldNotification"

export const EditingMenu = (props) => {
  // const handleEsc = (event) => {
  //     if (event.key === 'Escape') {
  //         props.setIsEditingActive(prev => !prev)
  //     }
  // };
  // useEffect(() => {
  //     window.addEventListener('keydown', handleEsc);
  //
  //     return () => {
  //         window.removeEventListener('keydown', handleEsc);
  //     };
  // }, []);
  return (
    // <div className={"editingScreen"}>
    //     <div className={"blackout"} onClick={() => props.setIsEditingActive(false)}></div>
    //     <div className={"container"}>
    //         {
    //             {
    //                 "nameScreen": <NewName setIsEditingActive={props.setIsEditingActive}/>,
    //                 "emailScreen": <NewNumber setIsEditingActive={props.setIsEditingActive}/>,
    //                 "tagScreen": <NewTag setIsEditingActive={props.setIsEditingActive}/>,
    //                 "passwordScreen": <NewPassword setIsEditingActive={props.setIsEditingActive}/>
    //             }[props.activeEditingScreen]
    //         }
    //     </div>
    // </div>
    <FieldNotification isActive={() => props.setIsEditingActive(false)}>
      <div className={"editingMenu"}>
        {
          {
            nameScreen: (
              <NewName setIsEditingActive={props.setIsEditingActive} />
            ),
            emailScreen: (
              <NewNumber setIsEditingActive={props.setIsEditingActive} />
            ),
            tagScreen: <NewTag setIsEditingActive={props.setIsEditingActive} />,
            passwordScreen: (
              <NewPassword setIsEditingActive={props.setIsEditingActive} />
            ),
          }[props.activeEditingScreen]
        }
      </div>
    </FieldNotification>
  )
}
