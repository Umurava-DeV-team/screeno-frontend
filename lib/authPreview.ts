import type {DemoRole} from "./demo/types";
type Challenge={role:DemoRole;kind:"verify"|"reset";intent:"login"|"signup";email:string;expires:number;attempts:number;verified:boolean};
let challenge:Challenge|null=null;
export const DEMO_2FA_CODE="123456";
export function beginAuthPreview(role:DemoRole,kind:"verify"|"reset",now=Date.now(),intent:"login"|"signup"="login",email=""){challenge={role,kind,intent,email,expires:now+5*60_000,attempts:0,verified:false};}
export function hasAuthPreview(role:DemoRole,kind:"verify"|"reset",now=Date.now()){return !!challenge&&challenge.role===role&&challenge.kind===kind&&challenge.expires>now&&challenge.attempts<5;}
export function authPreviewDetails(role:DemoRole,kind:"verify"|"reset"){return challenge?.role===role&&challenge.kind===kind?{email:challenge!.email,intent:challenge!.intent,expires:challenge!.expires}:null;}
export function verifyAuthPreview(role:DemoRole,code:string,now=Date.now()){
 if(!hasAuthPreview(role,"verify",now))return {ok:false,message:"Start sign-in again. This demo step has expired or has too many attempts."};
 challenge!.attempts++;if(code!==DEMO_2FA_CODE)return {ok:false,message:challenge!.attempts>=5?"Too many attempts. Start sign-in again.":"That code is not correct. Use the demo code 123456."};
 challenge=null;return {ok:true,message:""};
}
export function verifyResetPreview(role:DemoRole,code:string,now=Date.now()){
 if(!hasAuthPreview(role,"reset",now))return {ok:false,message:"This reset code has expired. Request another code."};
 challenge!.attempts++;if(code!==DEMO_2FA_CODE)return {ok:false,message:"That code is not correct. Use the demo code 123456."};
 challenge!.verified=true;return {ok:true,message:""};
}
export function completeResetPreview(role:DemoRole,now=Date.now()){if(!challenge||challenge.role!==role||challenge.kind!=="reset"||challenge.expires<=now||!challenge.verified)return false;challenge=null;return true;}
export function passwordError(password:string,confirmation:string){if(password.length<10)return "Use at least 10 characters.";if(password!==confirmation)return "Your passwords do not match.";return "";}