import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="pt-16">
        <Outlet />
      </div>
    </div>
  );
}
