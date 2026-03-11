import { Outlet } from "react-router";
import { BottomNav } from "./BottomNav";

export function Layout() {
  return (
    <div
      className="mx-auto flex min-h-screen flex-col"
      style={{
        backgroundColor: "#FFFEE5",
        maxWidth: 430,
      }}
    >
      <div className="flex-1 overflow-y-auto pb-28">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
