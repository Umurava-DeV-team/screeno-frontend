import ScreenoMark from "@/components/ScreenoMark";
export default function Loading(){
 return <main className="screeno-loading screeno-loading-minimal" role="status" aria-label="Loading Screeno" aria-busy="true">
  <div className="screeno-orbit-loader" aria-hidden="true">
   <span className="screeno-loader-frame frame-outer"/>
   <span className="screeno-loader-frame frame-inner"/>
   <div className="screeno-loader-logo"><ScreenoMark size={52}/></div>
   <div className="screeno-loader-eyes"><i><b/></i><i><b/></i></div>
  </div>
 </main>;
}
