import { createBrowserRouter } from "react-router";
import Layout from "./Layout";
import Home from "./pages/Home";
import { QuestsScreen } from "./components/QuestsScreen";
import { RewardsScreen } from "./components/RewardsScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import NotFound from "./pages/NotFound";

import CourseView from "./pages/CourseView";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "courses", Component: QuestsScreen },
      { path: "courses/:day", Component: CourseView },
      { path: "rewards", Component: RewardsScreen },
      { path: "profile", Component: ProfileScreen },
      { path: "*", Component: NotFound },
    ],
  },
]);
