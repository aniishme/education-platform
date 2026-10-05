import { useEffect, useState } from "react";
import { api } from "../services/api";
export default function useResource(path) {
  const [state, setState] = useState({ path, data: null, error: "", loading: true });
  const [version, setVersion] = useState(0);
  useEffect(() => {
    let current = true;
    api(path)
      .then((data) => {
        if (current) setState({ path, data, error: "", loading: false });
      })
      .catch((error) => {
        if (current)
          setState({ path, data: null, error: error.message, loading: false });
      });
    return () => {
      current = false;
    };
  }, [path, version]);
  return { ...(state.path===path?state:{data:null,error:'',loading:true}), reload: () => setVersion((v) => v + 1) };
}
