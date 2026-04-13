import Header from "./components/Header";
import { Outlet } from "react-router-dom";

function App() {
  return (
    /** 
     * o cabecalha e o trigger de tema são conteudo fixos entao estao sempre
     * presentes na pagina, o resto é renderizado no outlet, com o conteudo variando
     * com base na pagina na qual o usuario esta presente.
    */ 
    <>
      <Header /> 

      <main className="w-full">
        <Outlet />
      </main>
    </>
  );
}

export default App;
