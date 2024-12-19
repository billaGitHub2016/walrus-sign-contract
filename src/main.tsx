import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "./views/404";
import SuiProvider from "./context/sui-provider.tsx";
import SignContract from "./views/sign-contract";
import MyContracts from "./views/my-contracts";
import Home from "./views/home"

export const routes = [
  {
    path: "/",
    element: <Home></Home>,
    breadcrumbName: '首页'
  },
  {
    path: '/sign-contract',
    element: <SignContract></SignContract>,
    breadcrumbName: '合同签署'
  },
  {
    path: '/my-contracts',
    element: <MyContracts></MyContracts>,
    breadcrumbName: '我的合同'
  }
]

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <SuiProvider>
        <App></App>
      </SuiProvider>
    ),
    errorElement: <NotFoundPage></NotFoundPage>,
    children: routes,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
