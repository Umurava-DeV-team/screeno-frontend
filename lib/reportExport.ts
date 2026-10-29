export type ReportData={title:string;columns:string[];rows:(string|number|null|undefined)[][];subtitle?:string;filename?:string};
export type PdfFonts={regular:string;bold:string};
const safeCell=(value:unknown)=>{let text=String(value??"");if(/^[\s\uFEFF]*[=+@\-]|^[\t\r]/.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';};
export function reportCsv(report:ReportData){return "\uFEFF"+[report.columns,...report.rows].map(row=>row.map(safeCell).join(",")).join("\r\n");}
export function reportFilename(report:ReportData){return (report.filename||report.title).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"screeno-report";}
function save(blob:Blob,name:string){const url=URL.createObjectURL(blob),link=document.createElement("a");link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function exportCsv(report:ReportData){save(new Blob([reportCsv(report)],{type:"text/csv;charset=utf-8;"}),reportFilename(report)+".csv");}
async function fontFile(response:Response){if(!response.ok)throw new Error("Could not load the report font.");const bytes=new Uint8Array(await response.arrayBuffer());let binary="";for(let offset=0;offset<bytes.length;offset+=8192)binary+=String.fromCharCode(...bytes.subarray(offset,offset+8192));return btoa(binary);}
export async function buildReportPdf(report:ReportData,fonts?:PdfFonts){
 const [{jsPDF},{default:autoTable}]=await Promise.all([import("jspdf"),import("jspdf-autotable")]);
 const embedded=fonts??{regular:await fontFile(await fetch("/fonts/manrope/Manrope-Regular.ttf",{cache:"force-cache"})),bold:await fontFile(await fetch("/fonts/manrope/Manrope-Bold.ttf",{cache:"force-cache"}))};
 const pdf=new jsPDF({orientation:report.columns.length>5?"landscape":"portrait",unit:"mm",format:"a4",compress:true});
 pdf.addFileToVFS("Manrope-Regular.ttf",embedded.regular);pdf.addFont("Manrope-Regular.ttf","Manrope","normal");pdf.addFileToVFS("Manrope-Bold.ttf",embedded.bold);pdf.addFont("Manrope-Bold.ttf","Manrope","bold");
 pdf.setProperties({title:report.title,author:"Screeno",subject:report.subtitle||"Recruitment workspace report",creator:"Screeno"});
 const width=pdf.internal.pageSize.getWidth(),height=pdf.internal.pageSize.getHeight();
 const date=new Intl.DateTimeFormat("en-GB",{dateStyle:"medium",timeStyle:"short",timeZone:"Africa/Johannesburg"}).format(new Date());
 function header(){pdf.setFillColor(6,73,181);pdf.rect(0,0,width,32,"F");pdf.setFillColor(177,255,67);pdf.rect(14,11,2,11,"F");pdf.setFont("Manrope","bold");pdf.setFontSize(17);pdf.setTextColor(255,255,255);pdf.text("screeno.",20,18);pdf.setFont("Manrope","normal");pdf.setFontSize(8);pdf.text("RECRUITMENT WORKSPACE",20,24);pdf.text("Generated "+date+" SAST",width-14,18,{align:"right"});}
 pdf.setFont("Manrope","bold");pdf.setFontSize(15);pdf.setTextColor(36,50,52);const titleLines=pdf.splitTextToSize(report.title,width-28);pdf.text(titleLines,14,43);const captionY=43+titleLines.length*6;
 pdf.setFont("Manrope","normal");pdf.setFontSize(8);pdf.setTextColor(100,116,139);
 const caption=pdf.splitTextToSize((report.subtitle||"Current filtered view")+" | "+report.rows.length+" records",width-28);pdf.text(caption,14,captionY);
 autoTable(pdf,{head:[report.columns],body:report.rows.map(row=>row.map(value=>String(value??""))),startY:captionY+5+Math.max(0,caption.length-1)*4,margin:{top:40,right:14,left:14,bottom:18},styles:{font:"Manrope",fontSize:8.5,cellPadding:3,overflow:"linebreak",textColor:[51,65,85],lineColor:[229,235,242],lineWidth:.15},headStyles:{fillColor:[235,242,253],textColor:[38,69,108],fontStyle:"bold",fontSize:8.5},alternateRowStyles:{fillColor:[246,250,248]},didDrawPage:header});
 if(!report.rows.length){pdf.setFont("Manrope","normal");pdf.setTextColor(100,116,139);pdf.text("No records match this view.",14,captionY+25+Math.max(0,caption.length-1)*4);}
 for(let page=1;page<=pdf.getNumberOfPages();page++){pdf.setPage(page);pdf.setDrawColor(224,231,239);pdf.line(14,height-14,width-14,height-14);pdf.setFont("Manrope","normal");pdf.setFontSize(7);pdf.setTextColor(100,116,139);const footer=pdf.splitTextToSize("Screeno | Local frontend preview | "+report.title,width-50)[0];pdf.text(footer,14,height-9);pdf.text("Page "+page+" of "+pdf.getNumberOfPages(),width-14,height-9,{align:"right"});}
 return pdf;
}
export async function exportPdf(report:ReportData){const pdf=await buildReportPdf(report);pdf.save(reportFilename(report)+".pdf");}