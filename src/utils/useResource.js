import { useEffect, useState } from 'react';
import { api } from '../services/api';
export default function useResource(path) {
 const [state,setState] = useState({data:null,error:'',loading:true});
 const [version,setVersion] = useState(0);
 useEffect(() => {
  let current=true;
  api(path).then(data=>{if(current)setState({data,error:'',loading:false});})
   .catch(error=>{if(current)setState({data:null,error:error.message,loading:false});});
  return ()=>{current=false;};
 },[path,version]);
 return {...state,reload:()=>setVersion(v=>v+1)};
}
