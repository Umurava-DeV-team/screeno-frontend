"use client";
import {useCallback,useSyncExternalStore} from "react";
export function useProfilePhoto(userId?:string){
 const subscribe=useCallback((listener:()=>void)=>{window.addEventListener("screeno-profile-updated",listener);window.addEventListener("storage",listener);return()=>{window.removeEventListener("screeno-profile-updated",listener);window.removeEventListener("storage",listener);};},[]);
 const snapshot=useCallback(()=>{try{return userId?localStorage.getItem("screeno.avatar:"+userId)||"":"";}catch{return "";}},[userId]);
 return useSyncExternalStore(subscribe,snapshot,()=>"");
}