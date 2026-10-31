(() => {
'use strict';
const data=JSON.parse(document.querySelector('#site-data').textContent),{page,lang,detail:d,houseId,gallery:photos}=data;
if(!page)return;
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
const {motion,E,rm,phone}=window.thurranes.motion;
const animate=!!window.gsap;
// Route arrival and reveal-once reading surfaces. Back restoration skips arrival.
if(animate){const mm=gsap.matchMedia();mm.add('(prefers-reduced-motion:no-preference)',()=>{
 if(performance.getEntriesByType('navigation')[0]?.type!=='back_forward'){
  gsap.fromTo($('.detail-page h1'),{opacity:.7,y:phone.matches?6:12},{opacity:1,y:0,duration:motion.settle,ease:'power2.out'});
  if($('.gallery-main img'))gsap.fromTo($('.gallery-main img'),{opacity:.8},{opacity:1,duration:motion.settle,delay:motion.stagger,ease:'power2.out'});
 }
 const reveal=(el,from,to,delay=0)=>{if(!el||el.dataset.detailRevealed||el.getBoundingClientRect().top<=innerHeight*.85)return;gsap.fromTo(el,from,{...to,duration:motion.settle,delay,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 85%',once:true,onEnter:()=>{el.dataset.detailRevealed='true';}}});};
 $$('.amenities h2,.rules h2,.availability h2').forEach(el=>reveal(el,{opacity:.7},{opacity:1}));
 $$('.related-grid img').forEach((el,i)=>reveal(el,{opacity:.8},{opacity:1},phone.matches?0:motion.stagger*i));
 if(page==='contact')reveal($('.contact-grid .map'),{opacity:.8},{opacity:1});
 return()=>gsap.set($$('.detail-page h1,.gallery-main img,.amenities h2,.rules h2,.availability h2,.related-grid img,.contact-grid .map'),{clearProps:'transform,opacity'});
 });
}
if(page!=='house')return;
// Inline calendar: a genuinely independent, root-scoped engine mount. A valid
// selection is replayed through the public DOM controls into the shared sheet.
const inline=$('#inline-booking'),house=data.houses.find(h=>h.id===houseId);let dates=[],syncing=false,inlineTouched=false,calendarGhost=null;
const within=s=>$(s,inline);
const engine=mountBooking(inline,{lang,min:1,max:house.max,guests:2,taken:()=>false});engine.prepare();
function note(){if(houseId==='farmhouse')within('.bk-gnote').textContent=data.copy.group;}
note();
function selection(){return {house:houseId,dates:[...dates],guests:parseInt(within('.bk-n').textContent,10)||2};}
function summary(){const text=dates.length===2?dates.join(' → '):house.meta[0];$('.house-book-summary').textContent=text;$$('.house-book-bar [data-book],.inline-book-action [data-book]').forEach(b=>b.textContent=dates.length===2?d.continue:d.chooseDates);note();}
// Outgoing calendar is a purely visual snapshot: stripped IDs/classes/names
// prevent it from joining the engine's date query or focus order.
function captureCalendar(){if(!animate||rm.matches)return null;const source=within('.bk-months'),clone=source.cloneNode(true),original=[source,...source.querySelectorAll('*')],copies=[clone,...clone.querySelectorAll('*')];const properties=['display','grid-template-columns','gap','padding','margin','font','line-height','text-align','color','background-color','border','width','height','box-sizing','align-items','justify-content'];original.forEach((el,i)=>{const cs=getComputedStyle(el),out=copies[i];for(const a of [...out.attributes])out.removeAttribute(a.name);properties.forEach(p=>out.style.setProperty(p,cs.getPropertyValue(p)));});const rect=source.getBoundingClientRect(),parent=within('.bk-dates').getBoundingClientRect();Object.assign(clone.style,{position:'absolute',top:rect.top-parent.top+'px',left:'0',width:rect.width+'px',height:rect.height+'px',zIndex:'2',pointerEvents:'none'});clone.inert=true;clone.setAttribute('aria-hidden','true');return clone;}
inline.addEventListener('click',e=>{if(syncing||!e.target.closest('.bk-next:not(:disabled),.bk-prev:not(:disabled)'))return;if(calendarGhost){gsap.killTweensOf(calendarGhost);calendarGhost.remove();}calendarGhost=captureCalendar();},true);
inline.addEventListener('click',e=>{const day=e.target.closest('.bk-d:not(:disabled)');if(day){const k=day.dataset.d;dates=!dates.length||dates.length===2||k<=dates[0]?[k]:[dates[0],k];}if(!syncing)inlineTouched=true;summary();const nav=e.target.closest('.bk-next,.bk-prev');if(nav&&!syncing&&animate&&!rm.matches){within('.bk-months').getAnimations({subtree:true}).forEach(a=>a.cancel());const dir=nav.classList.contains('bk-next')?1:-1;if(calendarGhost){const old=calendarGhost;within('.bk-dates').append(old);gsap.to(old,{x:-dir*(phone.matches?8:16),opacity:0,duration:motion.crossfade,ease:'power2.out',onComplete:()=>{old.remove();if(calendarGhost===old)calendarGhost=null;}});}gsap.fromTo($$('.bk-dow,.bk-days',inline),{x:dir*(phone.matches?8:16),opacity:0},{x:0,opacity:1,duration:motion.crossfade,ease:'power2.out',overwrite:true});}});
function replay(saved){if(saved?.house!==houseId)return;const active=document.activeElement;syncing=true;engine.reset();dates=[];for(const k of saved.dates||[]){let tries=0;while(!within(`[data-d="${k}"]`)&&tries++<18){const first=within('.bk-d')?.dataset.d;const next=within(k<first?'.bk-prev:not(:disabled)':'.bk-next:not(:disabled)');if(!next)break;next.click();}within(`[data-d="${k}"]:not(:disabled)`)?.click();}let count=parseInt(within('.bk-n').textContent,10);while(count<saved.guests&&!within('.bk-plus').disabled){within('.bk-plus').click();count++;}while(count>saved.guests&&!within('.bk-minus').disabled){within('.bk-minus').click();count--;}syncing=false;summary();(active===document.body?$('.detail-page h1'):active)?.focus?.({preventScroll:true});}
const initialFocus=document.activeElement;try{replay(JSON.parse(sessionStorage.getItem('thurranes-selection')));}catch{}initialFocus?.focus?.({preventScroll:true});
inline.querySelector('form').addEventListener('submit',e=>{if(dates.length!==2)return;e.preventDefault();e.stopImmediatePropagation();window.thurranes.openSelection(selection(),within('.bk-action'),e.submitter?.dataset.keyboard==='true');},true);
within('.bk-action').addEventListener('click',e=>{e.currentTarget.dataset.keyboard=String(e.detail===0);});
document.addEventListener('click',e=>{const trigger=e.target.closest('[data-book]');if(!trigger||trigger.closest('#book'))return;if(trigger.dataset.house&&trigger.dataset.house!==houseId)return;e.preventDefault();e.stopImmediatePropagation();window.thurranes.openSelection(selection(),trigger,e.detail===0);},true);
$('#book').addEventListener('close',()=>{const saved=window.thurranes.getSelection();if(saved.house===houseId){replay(saved);inlineTouched=true;}});
$$('[data-language]').forEach(a=>a.addEventListener('click',()=>{try{if(inlineTouched||dates.length)sessionStorage.setItem('thurranes-selection',JSON.stringify(selection()));}catch{}}));
// Sticky booking summary appears after overview, yields to calendar/footer and
// the software keyboard. Its own focused control is retained until blur.
const sticky=$('.house-book-bar'),overview=$('.house-overview'),availability=$('.availability'),footer=$('.footer');let barOn=false;
if(animate)gsap.set(sticky,{y:0,yPercent:100});
function updateBar(){const a=availability.getBoundingClientRect(),f=footer.getBoundingClientRect(),o=overview.getBoundingClientRect();const keyboard=window.visualViewport&&visualViewport.height<innerHeight*.75;const obstructed=(a.top<innerHeight&&a.bottom>0)||f.top<=innerHeight;let show=o.bottom<72&&!(a.top<innerHeight&&a.bottom>0)&&f.top>innerHeight&&!keyboard&&!document.querySelector('dialog[open]');if(sticky.contains(document.activeElement)&&!keyboard){if(obstructed)(a.top<innerHeight&&a.bottom>0?$('.inline-book-action button'):$('a',footer)).focus({preventScroll:true});else show=true;}if(show===barOn)return;barOn=show;sticky.inert=!show;sticky.setAttribute('aria-hidden',String(!show));if(animate)gsap.to(sticky,{yPercent:show?0:100,opacity:show?1:0,duration:rm.matches?0:motion.crossfade,ease:'power2.out',overwrite:true});else{sticky.style.opacity=show?'1':'0';sticky.style.transform=show?'none':'translateY(100%)';}}
addEventListener('scroll',updateBar,{passive:true});addEventListener('resize',updateBar);visualViewport?.addEventListener('resize',updateBar);document.addEventListener('focusout',()=>queueMicrotask(updateBar));new MutationObserver(updateBar).observe($('#book'),{attributes:true,attributeFilter:['open']});updateBar();
// Gallery: native dialog, contain image, separate captions, explicit controls.
const dialog=$('#gallery'),panel=$('.gallery-panel'),bg=$('.gallery-bg'),full=$('.gallery-full'),frame=$('.gallery-frame'),main=$('.gallery-main img');
let index=0,mainIndex=0,opener=null,opening=false,epoch=0,modalTween=null,changeTween=null,thumbTween=null,imageToken=0;
function assign(img,p){img.srcset=p.srcset;img.src=p.src;img.alt=p.caption;img.width=p.width;img.height=p.height;}
function neighbors(i){for(const n of [(i+1)%photos.length,(i+photos.length-1)%photos.length]){const image=new Image();image.src=photos[n].src;}}
function caption(){const p=photos[index];$('.gallery-panel figcaption').textContent=p.caption;$('.gallery-count').textContent=`${index+1} / ${photos.length}`;}
function change(next,direction=1){index=(next+photos.length)%photos.length;const token=++imageToken;changeTween?.kill();caption();$('.gallery-error').hidden=true;
 const swap=()=>{if(token!==imageToken)return;assign(full,photos[index]);neighbors(index);};
 if(!animate||rm.matches){swap();if(animate)gsap.set(full,{opacity:1,x:0});return;}
 changeTween=gsap.timeline().to(full,{x:-direction*24,opacity:0,duration:.11,ease:'power2.out',onComplete:swap}).fromTo(full,{x:direction*24,opacity:0},{x:0,opacity:1,duration:.11,ease:'power2.out',immediateRender:false});
}
full.addEventListener('error',()=>{$('.gallery-error').hidden=false;});$('[data-gallery-retry]').addEventListener('click',()=>{full.src=photos[index].src;$('.gallery-error').hidden=true;});
function finishClose(){dialog.close();if(!document.querySelector('dialog[open]'))document.documentElement.classList.remove('modal-open');opener?.focus({preventScroll:true});updateBar();}
function move(open){opening=open;const token=++epoch;modalTween?.kill();if(!animate||rm.matches){if(animate)gsap.set(panel,{opacity:1,scale:1});bg.style.opacity='1';if(!open)finishClose();return;}
 const current=Number(gsap.getProperty(panel,'opacity'));const duration=Math.max(motion.feedback,motion.settle*Math.abs((open?1:0)-current));modalTween=gsap.timeline({onComplete:()=>{if(token===epoch&&!opening)finishClose();}}).to(panel,{opacity:open?1:0,scale:phone.matches?1:open?1:.98,duration,ease:open?E.open:E.close},0).to(bg,{opacity:open?1:0,duration,ease:'none'},0);
}
function open(trigger,viaKey){opener=trigger;index=mainIndex;assign(full,photos[index]);caption();if(!dialog.open){dialog.showModal();document.documentElement.classList.add('modal-open');if(animate)gsap.set(panel,{opacity:0,scale:phone.matches?1:.98});}move(true);(viaKey?$('[data-gallery-close]',panel):panel).focus({preventScroll:true});neighbors(index);updateBar();}
$('[data-gallery-open]').addEventListener('click',e=>open(e.currentTarget,e.detail===0));$$('[data-gallery-close]').forEach(b=>b.addEventListener('click',()=>move(false)));dialog.addEventListener('cancel',e=>{e.preventDefault();move(false);});
$('[data-gallery-prev]').addEventListener('click',()=>change(index-1,-1));$('[data-gallery-next]').addEventListener('click',()=>change(index+1,1));
dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')change(index+1,1);if(e.key==='ArrowLeft')change(index-1,-1);if(e.key==='Tab'){const controls=$$('button',panel).filter(el=>el.getClientRects().length);if(e.shiftKey&&(document.activeElement===controls[0]||document.activeElement===panel)){e.preventDefault();controls.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0].focus();}}});
let pointer=null;frame.addEventListener('pointerdown',e=>{if(e.isPrimary&&e.pointerType==='touch')pointer={id:e.pointerId,x:e.clientX,y:e.clientY};else pointer=null;});frame.addEventListener('pointercancel',()=>pointer=null);frame.addEventListener('pointerup',e=>{if(!pointer||pointer.id!==e.pointerId)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.abs(dx)>=48&&Math.abs(dx)>Math.abs(dy)*1.5)change(index+(dx<0?1:-1),dx<0?1:-1);});
let thumbToken=0;$$('[data-thumbnail]').forEach(b=>b.addEventListener('click',()=>{mainIndex=Number(b.dataset.thumbnail);$$('[data-thumbnail]').forEach(t=>t.setAttribute('aria-pressed',String(t===b)));const token=++thumbToken;thumbTween?.kill();const swap=()=>{if(token!==thumbToken)return;assign(main,photos[mainIndex]);$('.gallery-main figcaption').textContent=photos[mainIndex].caption;};if(!animate||rm.matches){swap();return;}thumbTween=gsap.timeline().to(main,{opacity:0,duration:.11,ease:'none',onComplete:swap}).to(main,{opacity:1,duration:.11,ease:'none'});}));
rm.addEventListener('change',()=>{if(!rm.matches)return;if(calendarGhost){gsap.killTweensOf(calendarGhost);calendarGhost.remove();calendarGhost=null;}modalTween?.kill();changeTween?.kill();thumbTween?.kill();epoch++;imageToken++;thumbToken++;assign(full,photos[index]);assign(main,photos[mainIndex]);if(animate){gsap.set([panel,full,main],{clearProps:'transform,opacity'});gsap.killTweensOf(sticky);gsap.set(sticky,{yPercent:barOn?0:100,opacity:barOn?1:0});gsap.killTweensOf($$('.bk-dow,.bk-days',inline));gsap.set($$('.bk-dow,.bk-days',inline),{clearProps:'transform,opacity'});}inline.getAnimations({subtree:true}).forEach(a=>a.finish());if(dialog.open&&!opening)finishClose();});
})();
