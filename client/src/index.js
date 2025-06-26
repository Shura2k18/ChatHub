import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import { ThemeProvider } from "./context/ThemeContext"
import { FontSizeProvider } from "./context/FontSizeContext"
import "./i18next"
import { Provider } from "react-redux"
import store from "./redux/store"
import { BrowserRouter } from "react-router-dom"
import { DevSupport } from "@react-buddy/ide-toolbox"
import { ComponentPreviews, useInitial } from "./dev"
import { SocketProvider } from "./context/SocketProvider"

const root = ReactDOM.createRoot(document.getElementById("root"))
root.render(
  <Provider store={store}>
    <ThemeProvider>
      <FontSizeProvider>
        <SocketProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SocketProvider>
      </FontSizeProvider>
    </ThemeProvider>
  </Provider>,
)
