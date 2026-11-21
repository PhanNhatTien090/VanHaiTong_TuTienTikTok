// 21/11/2026 — bộ tách khai báo CSS đơn giản (không CSS lồng nhau) cho việc gỡ !important (mục 4, docs/CAI-TIEN-2026-11-20.md).
// parseCss(text) → [{sel, prop, value, important, at, impStart, impEnd}] (at = chuỗi @media bao ngoài; impStart/impEnd = vị trí chữ !important trong text).
export function parseCss(text){
 const out=[];let i=0;const n=text.length;const stack=[];// mỗi phần tử: {type:'at'|'style'|'skip', prelude}
 let start=0;
 const skipComment=()=>{const e=text.indexOf('*/',i+2);i=e<0?n:e+2;};
 while(i<n){
  const ch=text[i];
  if(ch==='/'&&text[i+1]==='*'){skipComment();continue;}
  if(ch==='"'||ch==="'"){const q=ch;i++;while(i<n&&text[i]!==q){if(text[i]==='\\')i++;i++;}i++;continue;}
  if(ch==='{'){
   const prelude=text.slice(start,i).replace(/\/\*[\s\S]*?\*\//g,'').trim();
   const parent=stack[stack.length-1];
   if(parent&&parent.type==='skip'){stack.push({type:'skip',prelude});}
   else if(prelude.startsWith('@')){const kw=prelude.slice(1).split(/[\s({]/)[0].toLowerCase();
    stack.push({type:['media','supports','layer','container'].includes(kw)?'at':'skip',prelude});}
   else{ // khối khai báo của 1 rule
    const sel=prelude,at=stack.filter(s=>s.type==='at').map(s=>s.prelude).join(' ');
    let j=i+1,declStart=j,depth=0;
    for(;j<n;j++){const c=text[j];
     if(c==='/'&&text[j+1]==='*'){const e=text.indexOf('*/',j+2);j=(e<0?n:e+2)-1;continue;}
     if(c==='"'||c==="'"){const q=c;j++;while(j<n&&text[j]!==q){if(text[j]==='\\')j++;j++;}continue;}
     if(c==='(')depth++;else if(c===')')depth--;
     else if((c===';'&&depth===0)||c==='}'){pushDecl(text,declStart,j,sel,at,out);declStart=j+1;if(c==='}')break;}
    }
    i=j+1;start=i;continue;
   }
   i++;start=i;continue;
  }
  if(ch==='}'){stack.pop();i++;start=i;continue;}
  if(ch===';'&&!stack.length){i++;start=i;continue;}
  i++;
 }
 return out;
}
function pushDecl(text,a,b,sel,at,out){
 const raw=text.slice(a,b);const clean=raw.replace(/\/\*[\s\S]*?\*\//g,'');const k=clean.indexOf(':');if(k<0)return;
 const prop=clean.slice(0,k).trim().toLowerCase();if(!prop)return;
 const m=/!\s*important\s*$/i.exec(clean.trimEnd());
 let impStart=-1,impEnd=-1;
 if(m){const r=/!\s*important/ig;let mm,last=null;while((mm=r.exec(raw)))last=mm;impStart=a+last.index;impEnd=impStart+last[0].length;}
 const value=clean.slice(k+1).replace(/!\s*important\s*$/i,'').trim();
 out.push({sel,prop,value,important:!!m,at,impStart,impEnd});
}
// Gỡ chữ !important ở các khai báo được chọn (theo chỉ số trong parseCss), giữ nguyên mọi thứ khác.
export function stripImportant(text,decls,remove){
 const cuts=decls.filter((d,ix)=>d.important&&remove.has(ix)).sort((x,y)=>y.impStart-x.impStart);
 let s=text;for(const d of cuts){let a=d.impStart;while(a>0&&s[a-1]===' ')a--;s=s.slice(0,a)+s.slice(d.impEnd);}return s;
}
