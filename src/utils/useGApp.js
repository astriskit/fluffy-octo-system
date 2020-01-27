import { useContext } from "react";
import AppContext from "../app.context";

const useGApp = () => {
  let tree = useContext(AppContext);
  return tree;
};

export default useGApp;
