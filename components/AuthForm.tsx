"use client";
import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {Eye,EyeOff,ArrowRight,CheckCircle2,Loader2} from "lucide-react";
import {AuthShell} from "./auth/AuthShell";
import {OtpInput,formatCountdown,useOtpExpiryCountdown,useResendCooldown} from "./auth/OtpInput";
import {useAppDispatch,useAppSelector} from "@/lib/store/hooks";
import {enterPreviewSession} from "@/lib/store/features/authSlice";
import {beginAuthPreview,authPreviewDetails,verifyAuthPreview,verifyResetPreview,completeResetPreview,passwordError,DEMO_2FA_CODE} from "@/lib/authPreview";
type Mode="login"|"register"|"forgot"|"reset"|"verify";
export default function AuthForm({role,mode}:{role:"recruiter"|"candidate";mode:Mode}){
 const router=useRouter(),dispatch=useAppDispatch(),{loading}=useAppSelector(state=>state.auth);
 const [form,setForm]=useState({name:"",email:"",password:"",confirm:""}),[code,setCode]=useState(""),[codeStep,setCodeStep]=useState(false),[visible,setVisible]=useState(false),[error,setError]=useState(""),[success,setSuccess]=useState(false);
 const cooldown=useResendCooldown(60,mode==="verify"),expiry=useOtpExpiryCountdown(300),signup=mode==="register",forgot=mode==="forgot",verify=mode==="verify",reset=mode==="reset",isCode=verify||(forgot&&codeStep);
 const base="/auth/"+role,field=(name:keyof typeof form)=>(event:React.ChangeEvent<HTMLInputElement>)=>setForm(value=>({...value,[name]:event.target.value}));
 async function verifyCode(value:string){
  if(value.length!==6||loading)return;setError("");
  if(forgot){const result=verifyResetPreview(role,value);if(!result.ok){setError(result.message);setCode("");return;}router.push(base+"/reset");return;}
  const intent=authPreviewDetails(role,"verify")?.intent,result=verifyAuthPreview(role,value);
  if(!result.ok){setError(result.message);setCode("");return;}
  if(intent==="signup"){setSuccess(true);return;}
  const session=await dispatch(enterPreviewSession(role));if(enterPreviewSession.fulfilled.match(session))router.replace("/"+role+"/dashboard");else setError("Could not open the demo. Please start sign-in again.");
 }
 async function submit(event:React.FormEvent){
  event.preventDefault();setError("");
  if(isCode){await verifyCode(code);return;}
  if(forgot){beginAuthPreview(role,"reset",Date.now(),"login",form.email);setCodeStep(true);cooldown.start();expiry.restart();return;}
  if(reset){const message=passwordError(form.password,form.confirm);if(message){setError(message);return;}if(!completeResetPreview(role)){setError("Verify a reset code first. Start from Forgot password.");return;}setSuccess(true);setForm(value=>({...value,password:"",confirm:""}));return;}
  if(signup&&form.password.length<10){setError("Use at least 10 characters.");return;}
  beginAuthPreview(role,"verify",Date.now(),signup?"signup":"login",form.email);setForm(value=>({...value,password:""}));router.push(base+"/verify");
 }
 function resend(){if(cooldown.left>0)return;const previous=authPreviewDetails(role,forgot?"reset":"verify");beginAuthPreview(role,forgot?"reset":"verify",Date.now(),previous?.intent||"login",previous?.email||form.email);setCode("");setError("");cooldown.start();expiry.restart();}
 return <AuthShell mode={signup?"signup":isCode?"verify":mode} recovery={forgot} footer={!success&&<p className="links-auth-return">{mode==="login"?"New here?":signup?"Already have an account?":verify?"Need a different email?":"Remembered it?"} <Link href={base+(mode==="login"?"/register":"/login")}>{mode==="login"?"Create an account":"Back to sign in"}</Link></p>} onGoogle={!forgot&&!reset&&!verify?()=>setError("Google sign-in is disconnected during frontend review. Use the email demo below."):undefined}>
 <nav className="links-auth-roles" aria-label="Choose account type">{(["recruiter","candidate"] as const).map(value=><Link key={value} aria-current={value===role?"page":undefined} href={"/auth/"+value+"/"+(verify||reset?"login":mode)}>{value==="recruiter"?"Recruiter":"Candidate"}</Link>)}</nav>
 <p className="links-demo-note">Frontend demo only. No email is sent and no real password is changed.</p>
 {error&&<p className="links-auth-alert" role="alert">{error}</p>}
 {success?<div className="links-auth-success" role="status"><CheckCircle2 size={30}/><h2>{reset?"Password reset preview complete":"Email verified"}</h2><p>{reset?"No real password was changed. Return to sign-in.":"Your demo email step is complete. Sign in to continue."}</p><Link className="links-auth-submit" href={base+"/login"}>Back to sign-in<ArrowRight size={15}/></Link></div>:<form className="links-auth-form" onSubmit={submit}>
 {isCode?<><p className="links-code-intro">Enter the six-digit {forgot?"reset":"verification"} code for <strong>{authPreviewDetails(role,forgot?"reset":"verify")?.email||"your account"}</strong>. {expiry.expired?"This code has expired.":"Expires in "+formatCountdown(expiry.left)+"."}</p><OtpInput value={code} onChange={setCode} onComplete={value=>void verifyCode(value)} disabled={loading||expiry.expired} invalid={!!error} autoFocus/><p className="links-demo-code">Demo code: <strong>{DEMO_2FA_CODE}</strong></p><button type="submit" className="links-auth-submit" disabled={loading||code.length!==6||expiry.expired}>{loading?<Loader2 size={15} className="animate-spin"/>:null}Continue<ArrowRight size={15}/></button><div className="links-auth-inline"><button type="button" disabled={cooldown.left>0} onClick={resend}>{cooldown.left?"Resend in "+formatCountdown(cooldown.left):"Resend code"}</button>{forgot?<button type="button" onClick={()=>{setCodeStep(false);setCode("");}}>Change email</button>:<Link href={base+"/login"}>Start again</Link>}</div></>:<>
 {signup&&<label>Name<input required autoComplete="name" maxLength={100} placeholder="Your name" value={form.name} onChange={field("name")}/></label>}
 {!reset&&<label>Email<input required type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" value={form.email} onChange={field("email")}/></label>}
 {!forgot&&<label>{reset?"New password":"Password"}<span className="links-password"><input required type={visible?"text":"password"} autoComplete={signup||reset?"new-password":"current-password"} minLength={signup||reset?10:1} maxLength={128} placeholder={signup||reset?"Create a strong password":"Enter your password"} value={form.password} onChange={field("password")}/><button type="button" aria-label={visible?"Hide password":"Show password"} onClick={()=>setVisible(!visible)}>{visible?<EyeOff size={16}/>:<Eye size={16}/>}</button></span></label>}
 {reset&&<label>Confirm password<input required type={visible?"text":"password"} autoComplete="new-password" minLength={10} maxLength={128} value={form.confirm} onChange={field("confirm")} placeholder="Enter password again"/></label>}
 {signup&&<p className="links-password-hint">Use at least 10 characters. A mix of words, numbers and symbols works well.</p>}
 {mode==="login"&&<div className="links-auth-inline"><button type="button" onClick={()=>setForm({...form,email:"alex@example.test",password:"ScreenoDemo123!"})}>Use demo details</button><Link href={base+"/forgot"}>Forgot password?</Link></div>}
 <button type="submit" className="links-auth-submit" disabled={loading}>{forgot?"Send reset code":reset?"Reset password":signup?"Create account":"Sign in"}<ArrowRight size={15}/></button>
 </>}
 </form>}
 </AuthShell>;
}
