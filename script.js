(() => {
'use strict';
const $ = id => document.getElementById(id);
const config = window.DREAMLAND;
const stage = $('stage');
const dialog = $('wish-dialog');
const accept = $('accept');
const curtains = $('curtain-intro');
$('place-link').href = config.placeUrl;
$('place-link').textContent = config.placeText;
$('wishlist-olya').href = config.wishlistOlya;
$('wishlist-liza').href = config.wishlistLiza;
function layout(){
  const width = stage.clientWidth;
  const mobile = matchMedia('(max-width:700px)').matches;
  const viewportHeight = window.innerHeight;
  const scale = mobile ? Math.min(width/375, 1.3) : Math.min(width/1280, Math.max(viewportHeight/1080, .75));
  stage.style.setProperty('--s', scale);
  stage.style.height = Math.max(viewportHeight,1080*scale)+'px';
  // Let the irregular, translucent inner edges overlap the artwork slightly.
  // No overlap on mobile or when there is no desktop side gutter.
  const gutter = mobile ? 0 : Math.max(0,(width-1280*scale)/2);
  const leftOverlap = gutter > 0 ? Math.max(2, width*24/1920) : -1;
  const rightOverlap = gutter > 0 ? Math.max(2, width*36/1920) : -1;
  const leftTravel = width*1022/1920-gutter-leftOverlap;
  const rightTravel = width*1001/1920-gutter-rightOverlap;
  curtains.style.setProperty('--curtain-left-travel',leftTravel+'px');
  curtains.style.setProperty('--curtain-right-travel',rightTravel+'px');
}
layout();window.addEventListener('resize',layout,{passive:true});
if ('ResizeObserver' in window) new ResizeObserver(layout).observe(stage);
// The curtain is a decorative intro, not a separate page or a loading screen.
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let introFinished = false;
function finishIntro(){
 if(introFinished)return;
 introFinished=true;
 curtains.classList.add('is-open');
 curtains.classList.remove('is-opening');
 stage.inert=false;
}
if(reducedMotion.matches){finishIntro();}
else{
 stage.inert=true;
 curtains.addEventListener('wheel',e=>{if(!introFinished)e.preventDefault();},{passive:false});
 const images = ['assets/curtain-left.png','assets/curtain-right.png'].map(src=>new Promise(resolve=>{
  const img=new Image();img.onload=img.onerror=resolve;img.src=src;
 }));
 const ready = Promise.race([Promise.all(images),new Promise(resolve=>setTimeout(resolve,900))]);
 ready.then(()=>setTimeout(()=>{
  if(introFinished)return;
  curtains.classList.add('is-opening');
  setTimeout(finishIntro,2150);
 },1050));
 // Skip motion immediately if the system preference changes during the intro.
 reducedMotion.addEventListener?.('change',e=>{if(e.matches)finishIntro();});
 // Failsafe: never leave the invitation blocked.
 setTimeout(finishIntro,4700);
}
// Перемешанный список: все пожелания без повторов до исчерпания списка.
let queue = [], previous = -1;
function pick(){
 const n = config.wishes.length;
 if(!n) return '';
 if(!queue.length){
  queue = Array.from({length:n},(_,i)=>i);
  for(let i=n-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[queue[i],queue[j]]=[queue[j],queue[i]];}
  if(n>1 && queue[0]===previous){[queue[0],queue[1]]=[queue[1],queue[0]];}
 }
 previous = queue.shift();return config.wishes[previous];
}
accept.addEventListener('click',()=>{
 if(dialog.open)return;
 $('wish-text').textContent = pick();
 dialog.showModal();fitWish();document.body.classList.add('modal-open');
});
function fitWish(){
 if(!dialog.open)return;
 const text=$('wish-text'), card=text.parentElement;
 text.style.fontSize='';
 const base=parseFloat(getComputedStyle(text).fontSize);
 const max=card.clientHeight-8;
 let size=base;
 while(text.scrollHeight>max && size>base*.65){size-=.35;text.style.fontSize=size+'px';}
}
window.addEventListener('resize',fitWish,{passive:true});
if(document.fonts)document.fonts.ready.then(fitWish);
$('close-wish').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{
 if(e.target!==dialog)return;
 const b=dialog.getBoundingClientRect();
 if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();
});
dialog.addEventListener('close',()=>{document.body.classList.remove('modal-open');accept.focus({preventScroll:true});});
})();
