import Header from "@/components/Header";
import { Outlet } from "react-router-dom";

function App() {
  return (

    <>
      <Header /> 

      <main className="w-full">
        <Outlet />
      </main>
    </>
  );
}

export default App;
