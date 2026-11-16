(() => {
 'use strict';
 const keptImages=[];
 window.MEOWZINE_IMAGE_CACHE=keptImages;
 const urls=new Set();
 for(const page of window.PAGE_MOTION||[]){
  for(const suffix of ['', '-cmyk']){
   urls.add(page.base+suffix+'.jpg');
   for(const layer of page.layers)urls.add(layer.file+suffix+'.jpg');
  }
 }
 for(let n=1;n<=16;n++)for(const dir of ['edition','edition-cmyk'])urls.add(`${dir}/${String(n).padStart(2,'0')}.jpg`);
 const assets=[...urls];let done=0;
 const label=document.getElementById('load-label'),bar=document.getElementById('load-progress');
 async function load(url){
  const img=new Image();img.decoding='async';
  await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(new Error(url));img.src=url;});
  if(img.decode)await img.decode();
  keptImages.push(img);
 }
 async function prepare(){
  let cursor=0;const failed=[];
  async function worker(){
   while(cursor<assets.length){
    const url=assets[cursor++];let ok=false;
    for(let attempt=0;attempt<2&&!ok;attempt++){try{await load(url);ok=true;}catch{}}
    if(!ok)failed.push(url);
    done++;const percent=Math.floor(done/assets.length*100);bar.value=percent;label.textContent=`Preparando todas las páginas · ${percent}%`;
   }
  }
  await Promise.all(Array.from({length:4},worker));
  if(failed.length){
   label.textContent='No se pudieron cargar algunas imágenes. Revisa la conexión y vuelve a intentarlo.';
   document.getElementById('load-retry').hidden=false;
   throw new Error('Incomplete magazine preload: '+failed.length+' images');
  }
  label.textContent='Revista lista';
 }
 document.getElementById('load-retry').onclick=()=>location.reload();
 window.MEOWZINE_READY=prepare();
 // Attach a handler immediately; reader.js also handles this promise.
 window.MEOWZINE_READY.catch(()=>{});
})();
