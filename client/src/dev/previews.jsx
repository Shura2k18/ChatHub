import { ComponentPreview, Previews } from "@react-buddy/ide-toolbox"
import { PaletteTree } from "./palette"
import MessengerPage from "../components/MessengerPage/MessengerPage"
import App from "../App"
import { FontSizeSelector } from "../components/Elements/SettingsMenu/ThemeScreen/FontSizeSelector/FontSizeSelector"

const ComponentPreviews = () => {
  return (
    <Previews palette={<PaletteTree />}>
      <ComponentPreview path="/MessengerPage">
        <MessengerPage />
      </ComponentPreview>
      <ComponentPreview path="/App">
        <App />
      </ComponentPreview>
      <ComponentPreview path="/FontSizeSelector">
        <FontSizeSelector />
      </ComponentPreview>
    </Previews>
  )
}

export default ComponentPreviews
