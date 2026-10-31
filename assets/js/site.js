(() => {
'use strict';
const data=JSON.parse(document.querySelector('#site-data').textContent),{lang,copy:c,houses,reviews}=data;
const scope=s=>s.startsWith('.bk-')?document.querySelector('#book'):document;
const $=(s,el=scope(s))=>el?.querySelector(s), $$=(s,el=scope(s))=>[...(el?.querySelectorAll(s)||[])];
const rm=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width: 767px)'),touch=matchMedia('(max-width: 768px), (pointer: coarse), (hover: none)');
const motion=Object.freeze({feedback:.14,crossfade:.22,settle:.466667,panel:.766667,reveal:.9,stagger:.08});
// Small numeric cubic-bezier solver replaces unvendored CustomEase. X inversion by bisection.
const bezier=(x1,y1,x2,y2)=>p=>{const b=(t,a,b)=>3*(1-t)**2*t*a+3*(1-t)*t*t*b+t**3;let lo=0,hi=1;for(let i=0;i<18;i++){const m=(lo+hi)/2;if(b(m,x1,x2)<p)lo=m;else hi=m;}return b((lo+hi)/2,y1,y2);};
const E={open:bezier(.450338,0,.098644,.951110),close:bezier(.899977,.047782,.550254,1),photo:bezier(.417875,.063378,.231709,.942504)};
let picker=null;
window.thurranes={picker:null};
const hasGSAP=!!window.gsap;
if(hasGSAP)gsap.registerPlugin(ScrollTrigger);
const pickerSection=$('#husin');
function alignPicker(){if(pickerSection&&Math.abs(pickerSection.getBoundingClientRect().top)>.5)window.scrollTo({top:scrollY+pickerSection.getBoundingClientRect().top,behavior:'instant'});}
function mountPicker(){if(picker||!window.StayPicker)return;picker=StayPicker.mount($('#stay-picker'),{rest:.44,brand:lang==='is'?'EITT HÚS FYRIR HÓPA · ÞRJÚ SUMARHÚS':'ONE GROUP HOUSE · THREE COTTAGES',exploreLabel:lang==='is'?'Skoða':'Explore',labels:lang==='is'?{previous:'Fyrra',next:'Næsta',close:'Loka',details:'Um húsið'}:{previous:'Previous',next:'Next',close:'Close',details:'About the house'},headline:c.headline,units:houses,bookLabel:c.book});
 const open=picker.open;picker.open=(...args)=>{alignPicker();return open(...args);};window.thurranes.picker=picker;
 // Component clicks call its internal open; capture aligns before that handler and its scroll-lock snapshot.
 pickerSection.addEventListener('click',e=>{if(e.target.closest('.sp-unit'))alignPicker();},true);
}
if(pickerSection){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.intersectionRatio>=.25)){mountPicker();observer.disconnect();}},{threshold:.25});observer.observe(pickerSection);
 // Forward can reopen the component through its internal history listener.
 addEventListener('popstate',()=>{if(picker&&Object.values(history.state||{}).some(v=>v?.unit))alignPicker();});
}
// Shared CSS variables keep the clipped word copies pixel-aligned at every frame.
const landing=$('.landing'),art=$('.landing-art');let arrival=null;
// Seat the word on the ridge: the mask's highest land pixel is row 283 of 853 (left peak). The cover crop moves it, so
// measure the frame, find the crest in frame px and let the ridge hide about a third of the left letters' caps.
function seatWord(){
 const img=$('.landing-photo img');if(!art||!img)return;const f=art.getBoundingClientRect();if(!f.width)return;
 const ratio=(img.naturalHeight||1334)/(img.naturalWidth||2000),h=Math.max(f.height,f.width*ratio);
 const fy=parseFloat(getComputedStyle(img).objectPosition.split(' ')[1])/100||.5;
 const crest=283/853*h-(h-f.height)*fy,size=f.width*.196834;
 art.style.setProperty('--word-y',Math.round(crest-.46*size)+'px');
}
if(art){seatWord();addEventListener('resize',seatWord);$('.landing-photo img')?.addEventListener('load',seatWord);}
if(landing&&hasGSAP){
 const photos=$$('.landing-photo'),frame=$('.landing-frame'),rows=$$('.landing-nav,.landing-base');
 const letters=Array.from({length:8},(_,i)=>({rise:70,opacity:0,index:i}));
 const paintLetter=l=>{art.style.setProperty(`--rise-${l.index}`,l.rise+'%');art.style.setProperty(`--ink-${l.index}`,l.opacity);};
 $$('.landing-letter').forEach(el=>{const i=el.style.getPropertyValue('--letter');el.style.setProperty('--rise',`var(--rise-${i},0%)`);el.style.setProperty('--ink-opacity',`var(--ink-${i},1)`);});
 function settleLanding(){arrival?.kill();gsap.set([frame,...photos,...rows],{clearProps:'transform,opacity,clipPath'});letters.forEach(l=>{l.rise=0;l.opacity=1;paintLetter(l);});}
 const picture=$('.landing-photo img');
 Promise.race([Promise.all([picture.decode().catch(()=>{}),document.fonts.ready]),new Promise(resolve=>setTimeout(resolve,1200))]).then(()=>{
  if(rm.matches||scrollY>0||performance.getEntriesByType('navigation')[0]?.type==='back_forward'){settleLanding();return;}
  letters.forEach(paintLetter);gsap.set(frame,{clipPath:touch.matches?'inset(4% 3% 4% 3%)':'inset(6% 4% 6% 4%)'});gsap.set(photos,{scale:touch.matches?1.04:1.08});
  arrival=gsap.timeline().to(frame,{clipPath:'inset(0% 0% 0% 0%)',duration:motion.reveal,ease:E.photo},0).to(photos,{scale:1,duration:motion.reveal,ease:E.photo},0);
  letters.forEach((l,i)=>arrival.to(l,{rise:0,opacity:1,duration:motion.settle,ease:E.open,onUpdate:()=>paintLetter(l)},.3+i*(touch.matches?.035:.045)));
  rows.forEach((row,i)=>arrival.fromTo(row,{opacity:0,y:touch.matches?0:i?8:-6},{opacity:1,y:0,duration:motion.settle,ease:'power2.out'},.3+i*.08));
  window.thurranes.arrival=arrival;
 });
 // Scroll exit: both word copies slide up out from behind the ridge (the ink copy shows as it crosses the frame top).
 // Fine pointers get a 0.6s smoothed scrub; touch follows the finger 1:1 so it never trails iOS momentum.
 const media=gsap.matchMedia();media.add({fine:'(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',coarse:'not ((hover:hover) and (pointer:fine)) and (prefers-reduced-motion:no-preference)'},ctx=>{
  gsap.fromTo('.landing-word',{yPercent:0},{yPercent:-70,ease:'none',force3D:true,scrollTrigger:{trigger:landing,start:'top top',end:'bottom top',scrub:ctx.conditions.fine?.6:true,invalidateOnRefresh:true}});
 });
 rm.addEventListener('change',()=>{if(rm.matches)settleLanding();});
 addEventListener('pagehide',settleLanding);addEventListener('scroll',()=>{if(scrollY>0&&arrival?.isActive())settleLanding();},{passive:true});
}
// Modal P contract: native dialog owns inertness; animation owns only its own panel/backdrop.
let activeModal=null;
function modal(root,panel,bg,first){let tween=null,links=null,opener=null,target=false,epoch=0;const groups=$$('.menu-group',root);
 const finishClose=()=>{root.close();document.documentElement.classList.remove('modal-open');if(activeModal===api)activeModal=null;if(opener?.isConnected&&!opener.closest('[inert]'))opener.focus({preventScroll:true});};
 const move=(open)=>{const token=++epoch;target=open;if(root.id==='menu')$$('[data-menu]').forEach(b=>b.setAttribute('aria-expanded',String(open)));tween?.kill();links?.kill();const axis=phone.matches?'yPercent':'xPercent';const current=Number(hasGSAP?gsap.getProperty(panel,axis):0)||0;const end=open?0:100;const duration=Math.max(motion.feedback,motion.panel*Math.abs(end-current)/100);
  if(!hasGSAP||rm.matches){if(hasGSAP)gsap.set([panel,...groups],{clearProps:'transform,opacity'});bg.style.opacity=open?'1':'0';if(!open)finishClose();return;}
  tween=gsap.timeline({onComplete:()=>{if(token===epoch&&!target)finishClose();}}).to(panel,{[axis]:end,duration,ease:open?E.open:E.close},0).to(bg,{opacity:open?1:0,duration,ease:'none'},0);
  if(groups.length)links=open?gsap.fromTo(groups,{y:12,opacity:0},{y:0,opacity:1,duration:motion.settle,stagger:motion.stagger,delay:duration*.3,ease:'power2.out'}):gsap.to(groups,{opacity:0,duration:motion.feedback});
 };
 const api={open(trigger,viaKey=false){if(activeModal&&activeModal!==api)return;opener=trigger;activeModal=api;if(!root.open){root.showModal();document.documentElement.classList.add('modal-open');if(hasGSAP)gsap.set(panel,{xPercent:phone.matches?0:100,yPercent:phone.matches?100:0});}move(true);(viaKey?first()||panel:panel).focus({preventScroll:true});},close(){if(root.open)move(false);},settle(){if(!root.open)return;tween?.kill();links?.kill();epoch++;if(hasGSAP)gsap.set([panel,...groups],{clearProps:'transform,opacity'});bg.style.opacity=target?'1':'0';if(!target)finishClose();},get isOpen(){return root.open;}};
 root.addEventListener('cancel',e=>{e.preventDefault();api.close();});
 root.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const els=$$('a[href],button:not(:disabled),input,textarea,[tabindex="0"]',panel).filter(el=>!el.hidden&&!el.closest('[inert]')&&el.getClientRects().length);if(!els.length)return;const a=els[0],b=els.at(-1);if(e.shiftKey&&(document.activeElement===a||document.activeElement===panel)){e.preventDefault();b.focus();}else if(!e.shiftKey&&document.activeElement===b){e.preventDefault();a.focus();}});
 rm.addEventListener('change',()=>{if(rm.matches)api.settle();});phone.addEventListener('change',()=>api.settle());return api;
}
const book=$('#book'),bar=$('.bk-bar',book);let selected=null,lastStep='dates',pendingRestore=null,stepSnapshot=null,selectionDates=[];
// Decorative snapshots have no engine classes, names or IDs and cannot receive input.
// This keeps the unchanged engine's synchronous validation and state transitions authoritative.
const ghosts=new Set();
function snapshot(el){if(!hasGSAP||rm.matches||!el)return null;const clone=el.cloneNode(true),nodes=[el,...el.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];const props=['display','grid-template-columns','grid-template-rows','gap','align-items','justify-content','padding','margin','font','line-height','letter-spacing','text-align','color','background-color','border','border-radius','width','height','box-sizing','fill','stroke','stroke-width'];nodes.forEach((node,i)=>{const cs=getComputedStyle(node),copy=copies[i];for(const a of [...copy.attributes])copy.removeAttribute(a.name);props.forEach(p=>copy.style.setProperty(p,cs.getPropertyValue(p)));});const rect=el.getBoundingClientRect(),parent=$('.bk-body').getBoundingClientRect();Object.assign(clone.style,{position:'absolute',left:rect.left-parent.left+'px',top:rect.top-parent.top+$('.bk-body').scrollTop+'px',width:rect.width+'px',height:rect.height+'px',pointerEvents:'none',zIndex:'2'});clone.inert=true;clone.setAttribute('aria-hidden','true');return clone;}
function outgoing(ghost,distance){ghosts.forEach(g=>{gsap.killTweensOf(g);g.remove();});ghosts.clear();if(!ghost)return;$('.bk-body').append(ghost);ghosts.add(ghost);gsap.to(ghost,{opacity:0,x:-distance,duration:motion.crossfade,ease:'power2.out',onComplete:()=>{ghost.remove();ghosts.delete(ghost);}});}
book.addEventListener('submit',()=>{stepSnapshot=snapshot($(`.bk-${lastStep==='dates'?'dates':'who'}`));},true);
book.addEventListener('click',e=>{if(e.target.closest('.bk-back'))stepSnapshot=snapshot($('.bk-who'));const nav=e.target.closest('.bk-prev,.bk-next');if(nav&&!nav.disabled){const ghost=snapshot($('.bk-months')),direction=nav.classList.contains('bk-next')?1:-1;queueMicrotask(()=>{if(rm.matches||!hasGSAP){ghost?.remove();return;}$('.bk-months').getAnimations({subtree:true}).forEach(a=>a.cancel());ghosts.forEach(g=>{gsap.killTweensOf(g);g.remove();});ghosts.clear();outgoing(ghost,direction*(phone.matches?8:16));gsap.fromTo($$('.bk-dow,.bk-days'),{opacity:0,x:direction*(phone.matches?8:16)},{opacity:1,x:0,duration:motion.crossfade,ease:'power2.out',overwrite:true});});}},true);
const booking=mountBooking(book,{lang,min:1,max:6,guests:2,taken:()=>false,onStep(step){book.dataset.step=step;bar.scrollTop=0;const target=$(`.bk-${step==='dates'?'dates':step==='who'?'who':'done'}`,book);const direction=step==='dates'?-1:1;const old=$(`.bk-${lastStep==='dates'?'dates':lastStep==='who'?'who':'done'}`,book);lastStep=step;
 // Engine retains validation/submission behavior. Adapter focuses the step heading after engine's sync focus.
 if(step!=='dates')queueMicrotask(()=> $('h3',target)?.focus({preventScroll:true}));
 if(hasGSAP&&!rm.matches){outgoing(stepSnapshot,phone.matches?0:direction*12);stepSnapshot=null;gsap.killTweensOf([old,target]);gsap.fromTo(target,{opacity:0,x:phone.matches||step==='done'?0:direction*12},{opacity:1,x:0,duration:motion.crossfade,ease:step==='done'?'none':'power2.out'});}
}});
const menu=modal($('#menu'),$('.menu-panel'),$('.modal-bg'),()=>$('.menu-panel nav a'));
const sheet=modal(book,bar,$('.bk-bg'),()=>$('.bk-house button',book));
function groupNote(){if(selected==='farmhouse')$('.bk-gnote',book).textContent=c.group;}
function selectHouse(id){const h=houses.find(h=>h.id===id);if(!h)return;selected=id;selectionDates=[];book.dataset.house=id;$$('.bk-house button',book).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.house===id)));$('#bk-sub').textContent=h.name;booking.setHouse(h.max,()=>false);$('.bk-dates').inert=false;$('.bk-action').disabled=false;groupNote();if(book.open&&hasGSAP&&!rm.matches)gsap.fromTo($('.bk-dates'),{opacity:0,x:phone.matches?0:12},{opacity:1,x:0,duration:motion.crossfade,ease:'power2.out',overwrite:true});}
$$('.bk-house button',book).forEach(b=>b.addEventListener('click',()=>{if(b.dataset.house!==selected)selectHouse(b.dataset.house);}));
book.addEventListener('click',e=>{const day=e.target.closest('.bk-d:not(:disabled)');if(day){const k=day.dataset.d;selectionDates=!selectionDates.length||selectionDates.length===2||k<=selectionDates[0]?[k]:[selectionDates[0],k];}queueMicrotask(groupNote);});
function openBooking(trigger,viaKey,id){id=id||data.houseId;if(id&&pendingRestore&&id!==pendingRestore.house)pendingRestore=null;booking.prepare();if(id&&id!==selected)selectHouse(id);if(!selected){$('.bk-dates').inert=true;$('.bk-action').disabled=true;$('#bk-sub').textContent=c.pickHouse;}sheet.open(trigger,viaKey);if(pendingRestore){restoreDates(pendingRestore);pendingRestore=null;(viaKey?$('.bk-house button',book):bar).focus({preventScroll:true});}}
let requestToken=0;
document.addEventListener('keydown',e=>{if(e.key==='Escape')requestToken++;});
document.addEventListener('click',e=>{
 const pick=e.target.closest('.sp-book');if(pick){e.preventDefault();const id=houses[picker.activeIndex].id,token=++requestToken,trigger=$$('.sp-unit')[picker.activeIndex];picker.close();const wait=()=>{if(token!==requestToken)return;if(picker.state==='closed'){openBooking(trigger,e.detail===0,id);}else if(picker.state==='closing')requestAnimationFrame(wait);else requestToken++;};requestAnimationFrame(wait);return;}
 const launch=e.target.closest('[data-book]');if(launch){e.preventDefault();++requestToken;openBooking(launch,e.detail===0,launch.dataset.house);}
 if(e.target.closest('[data-book-close]')){++requestToken;sheet.close();}
 const menuButton=e.target.closest('[data-menu]');if(menuButton){++requestToken;menu.open(menuButton,e.detail===0);}
 if(e.target.closest('[data-menu-close]'))menu.close();
});
// Hero/picker/sticky handoff exposes only the currently usable navigation.
const heroNav=$('.landing-nav'),sticky=$('.sticky'),hero=$('#hero');let stickyOn=!hero;
if(hasGSAP)gsap.set(sticky,{y:0,yPercent:hero?-100:0,opacity:hero?0:1});
function navState(){if(!hero)return;const past=hero.getBoundingClientRect().bottom<=0,r=pickerSection.getBoundingClientRect(),expanded=picker&&picker.state!=='closed',overPicker=r.top<=.5&&r.bottom>0;
 const show=past&&!overPicker&&!expanded;
 if(show!==stickyOn){stickyOn=show;if(hasGSAP)gsap.to(sticky,{yPercent:show?0:-100,opacity:show?1:0,duration:rm.matches?0:motion.crossfade,ease:'power2.out',overwrite:true});else{sticky.style.opacity=show?'1':'0';sticky.style.transform=show?'none':'translateY(-100%)';}}
 sticky.inert=!show;sticky.setAttribute('aria-hidden',String(!show));heroNav.inert=past||!!expanded;heroNav.setAttribute('aria-hidden',String(past||!!expanded));
}
if(hero){addEventListener('scroll',navState,{passive:true});new MutationObserver(navState).observe($('#stay-picker'),{attributes:true,subtree:true,attributeFilter:['class','aria-modal']});navState();}
// Anchor focus is immediate; scroll remains native and respects reduced motion.
document.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const target=$(a.getAttribute('href'));if(!target)return;e.preventDefault();if(menu.isOpen){menu.close();setTimeout(()=>go(),rm.matches?0:motion.panel*1000);}else go();function go(){const heading=target.matches('h1,h2,h3')?target:$('h2',target)||target;heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});target.scrollIntoView({behavior:rm.matches?'instant':'smooth'});history.replaceState(null,'',a.getAttribute('href'));}});
// Original reviews: latest requested index wins, with height reserved for both quotations.
let reviewIndex=lang==='is'?0:1,quoteTween=null,reviewEpoch=0;const quote=$('.quote'),space=$('.quote-space');
function paintReview(){if(!quote)return;const r=reviews[reviewIndex];$('blockquote',quote).textContent=r.text;$('blockquote',quote).lang=r.lang;$('figcaption',quote).textContent=r.author;$('.review-count').textContent=`${reviewIndex+1} / ${reviews.length}`;}
$$('[data-review]').forEach(b=>b.addEventListener('click',()=>{reviewIndex=(reviewIndex+Number(b.dataset.review)+reviews.length)%reviews.length;const token=++reviewEpoch;quoteTween?.kill();const height=quote.offsetHeight;const ghost=quote.cloneNode(true);ghost.style.cssText='position:absolute;visibility:hidden;width:'+quote.offsetWidth+'px';$('blockquote',ghost).textContent=reviews[reviewIndex].text;space.append(ghost);space.style.minHeight=Math.max(height,ghost.offsetHeight)+'px';ghost.remove();if(!hasGSAP||rm.matches){paintReview();quote.style.opacity='1';space.style.minHeight='';return;}quoteTween=gsap.timeline().to(quote,{opacity:0,duration:.11,ease:'none',onComplete:()=>{if(token===reviewEpoch)paintReview();}}).to(quote,{opacity:1,duration:.11,ease:'none',onComplete:()=>{space.style.minHeight='';}});}));
if(hasGSAP&&!rm.matches&&performance.getEntriesByType('navigation')[0]?.type!=='back_forward')gsap.fromTo($('.site-content'),{opacity:.8},{opacity:1,duration:motion.crossfade,ease:'none'});
// R: reveal once; already-above-threshold content is never hidden on restored pages.
if(hasGSAP){const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion: no-preference)',()=>{
 const reveal=(el,from,to={},delay=0)=>{if(!el||el.getBoundingClientRect().top<=innerHeight*.85||el.dataset.revealed)return;gsap.fromTo(el,from,{...to,duration:to.duration||motion.settle,ease:to.ease||'power2.out',delay,scrollTrigger:{trigger:el,start:'top 85%',once:true,onEnter:()=>{el.dataset.revealed='true';}},onComplete:()=>{el.dataset.revealed='true';}});};
 reveal($('#farm h2'),{y:touch.matches?8:16,opacity:.65},{y:0,opacity:1});
 reveal($('.farm-photo'),{clipPath:`inset(${touch.matches?8:18}% 0 0 0)`},{clipPath:'inset(0% 0 0 0)',duration:motion.reveal,ease:E.photo});
 if(!touch.matches)reveal($('.farm-photo img'),{yPercent:-3},{yPercent:0,duration:motion.reveal,ease:E.photo});
 $$('.rule').forEach(el=>reveal(el,{scaleX:0},{scaleX:1}));
 $$('.house-card').forEach((el,i)=>{const delay=touch.matches?0:(i%2)*motion.stagger;reveal($('img',el),{opacity:.8},{opacity:1},delay);reveal($('.house-caption',el),{y:10},{y:0},delay);});
 $$('.subject').forEach(el=>{reveal($('img',el),{opacity:.75},{opacity:1});reveal($('.subject-caption h3',el),{y:8},{y:0},touch.matches?0:motion.stagger);});
 if(pickerSection)reveal($('.map'),{opacity:.7},{opacity:1});
 return ()=>{gsap.set($$('#farm h2,.farm-photo,.farm-photo img,.rule,.house-card img,.house-caption,.subject img,.subject-caption h3,.map'),{clearProps:'transform,opacity,clipPath'});};
 });
 // Picker reveal: each column's lower edge trails the viewport bottom by a stagger that closes as the section arrives (mask on the host
 // wrapper only, never inside the picker). Cleared at the end so the open picker and its fixed layers are never masked.
 if(pickerSection)mm.add('(min-width:769px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',()=>{
  const n=4,set=p=>{if(p>=1||(picker&&picker.state!=='closed')){pickerSection.style.removeProperty('mask-image');pickerSection.style.removeProperty('-webkit-mask-image');return}
   const g='linear-gradient(#000,#000)',img=Array(n).fill(g).join(','),r=pickerSection.getBoundingClientRect(),seen=innerHeight-r.top,lag=innerHeight*.22*(1-p),size=[...Array(n)].map((_,i)=>`${100/n+.05}% ${Math.round(Math.min(r.height,Math.max(0,seen-i*lag)))}px`).join(','),pos=[...Array(n)].map((_,i)=>`${i*100/(n-1)}% 0%`).join(',');
   for(const k of ['mask-image','-webkit-mask-image'])pickerSection.style.setProperty(k,img);for(const k of ['mask-size','-webkit-mask-size'])pickerSection.style.setProperty(k,size);for(const k of ['mask-position','-webkit-mask-position'])pickerSection.style.setProperty(k,pos);for(const k of ['mask-repeat','-webkit-mask-repeat'])pickerSection.style.setProperty(k,'no-repeat');};
  // Progress from the live rect each frame (ScrollTrigger cached this section's start before the page settled).
  let raf=0;const tick=()=>{raf=0;const t=pickerSection.getBoundingClientRect().top;set(Math.min(1,Math.max(0,1-t/innerHeight)))},on=()=>{if(!raf)raf=requestAnimationFrame(tick)};
  addEventListener('scroll',on,{passive:true});addEventListener('resize',on);tick();
  return()=>{removeEventListener('scroll',on);removeEventListener('resize',on);cancelAnimationFrame(raf);for(const k of ['mask-image','-webkit-mask-image','mask-size','-webkit-mask-size','mask-position','-webkit-mask-position','mask-repeat','-webkit-mask-repeat'])pickerSection.style.removeProperty(k)};
 });
 if(pickerSection)mm.add('(min-width:769px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)',()=>{gsap.timeline({scrollTrigger:{trigger:'.land-panorama',start:'top 80%',end:'top 20%',scrub:true,invalidateOnRefresh:true}}).fromTo('.land-panorama__window',{clipPath:'inset(0 16.667% 0 16.667%)'},{clipPath:'inset(0 0% 0 0%)',ease:'none'},0).fromTo('.land-panorama__image',{scale:1.06},{scale:1,ease:'none'},0);});
 Promise.all([document.fonts.ready,...$$('.site-content img').map(img=>img.complete?Promise.resolve():new Promise(r=>{img.addEventListener('load',r,{once:true});img.addEventListener('error',r,{once:true});}))]).then(()=>ScrollTrigger.refresh());
 $$('.site-content img').forEach(img=>img.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true}));document.fonts.ready.then(()=>ScrollTrigger.refresh());addEventListener('pageshow',()=>ScrollTrigger.refresh());
}
rm.addEventListener('change',()=>{if(!rm.matches)return;if(hasGSAP){gsap.killTweensOf($('.site-content'));gsap.set($('.site-content'),{opacity:1});}quoteTween?.kill();reviewEpoch++;paintReview();if(quote){quote.style.opacity='1';space.style.minHeight='';}if(hasGSAP){gsap.killTweensOf(sticky);gsap.set(sticky,{yPercent:!hero||stickyOn?0:-100,opacity:!hero||stickyOn?1:0});}ghosts.forEach(g=>{gsap.killTweensOf(g);g.remove();});ghosts.clear();stepSnapshot=null;if(hasGSAP){gsap.killTweensOf($$('.bk-dates,.bk-who,.bk-done,.bk-dow,.bk-days'));gsap.set($$('.bk-dates,.bk-who,.bk-done,.bk-dow,.bk-days'),{clearProps:'transform,opacity'});}book.getAnimations({subtree:true}).forEach(a=>a.finish());});
// Keep chosen house, dates and guest count across language routes without exposing guest details.
function saveSelection(){try{sessionStorage.setItem('thurranes-selection',JSON.stringify(pendingRestore||{house:selected,dates:selectionDates,guests:parseInt($('.bk-n').textContent,10)||2}));}catch{}}
function restoreDates(saved){if(!saved.house)return;selectHouse(saved.house);booking.prepare();for(const date of saved.dates||[]){let guard=0;while(!$(`.bk-d[data-d="${date}"]`,book)&&guard++<18){const first=$('.bk-d',book)?.dataset.d;const next=$(date<first?'.bk-prev:not(:disabled)':'.bk-next:not(:disabled)',book);if(!next)break;next.click();}$(`.bk-d[data-d="${date}"]:not(:disabled)`,book)?.click();}let n=parseInt($('.bk-n').textContent,10);while(n<saved.guests&&!$('.bk-plus').disabled){$('.bk-plus').click();n++;}while(n>saved.guests&&!$('.bk-minus').disabled){$('.bk-minus').click();n--;}groupNote();}
$$('[data-language]').forEach(a=>a.addEventListener('click',saveSelection));try{const saved=JSON.parse(sessionStorage.getItem('thurranes-selection'));if(saved?.house){pendingRestore=saved;selected=saved.house;}}catch{}
// Errors stay inline and immediate; relate them to the engine-selected invalid field.
new MutationObserver(()=>{const note=$('.bk-note');if(hasGSAP&&!rm.matches&&note.textContent)gsap.fromTo(note,{opacity:0},{opacity:1,duration:motion.feedback,ease:'none',overwrite:true});$$('.bk-fields input').forEach(i=>{const bad=!!note.textContent&&i===document.activeElement;i.setAttribute('aria-invalid',String(bad));if(bad)i.setAttribute('aria-describedby','booking-error');else i.removeAttribute('aria-describedby');});}).observe($('.bk-note'),{childList:true,subtree:true});
// Public host adapter: independent inline mount hands a selection into the sheet.
window.thurranes.openSelection=(saved,trigger,viaKey)=>{pendingRestore=saved;openBooking(trigger,viaKey,saved.house);};
window.thurranes.motion={motion,E,rm,phone};
window.thurranes.getSelection=()=>pendingRestore||{house:selected,dates:[...selectionDates],guests:parseInt($('.bk-n').textContent,10)||2};
})();
