export default function ScreenoMark({size=36}:{size?:number}){
 return <svg viewBox="0 0 40 40" width={size} height={size} fill="none" aria-hidden="true" focusable="false">
  <rect width="40" height="40" rx="3" fill="#0649b5"/>
  <path d="M15 8H30V14H16V18H25L30 23V30L26 34H10V28H24V24H15L10 19V13L15 8Z" fill="white"/>
  <path d="M30 3H37V10H33V7H30Z" fill="#b1ff43"/>
 </svg>;
}
