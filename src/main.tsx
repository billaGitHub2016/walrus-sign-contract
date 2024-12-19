import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import NotFoundPage from "./views/404";
import SuiProvider from "./context/sui-provider.tsx";
import SignContract from "./views/sign-contract";
import MyContracts from "./views/my-contracts";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <SuiProvider>
        <App></App>
      </SuiProvider>
    ),
    errorElement: <NotFoundPage></NotFoundPage>,
    children: [
      {
        path: "",
        element: (
          <div>
            <h3>首页</h3>
          </div>
        ),
      },
      {
          path: 'sign-contract',
          element: <SignContract></SignContract>,
      },
      {
          path: 'my-contracts',
          element: <MyContracts></MyContracts>,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
