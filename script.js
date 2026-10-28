const photos=[...document.querySelectorAll('.season-photo')];
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const notice=document.querySelector('.guest-notice');
const pause=document.querySelector('.season-pause');
let current=0,timer=null,paused=false,lockedUntil=0,wheelSum=0,lastWheel=0,touchStart=null;
function schedule(){clearTimeout(timer);if(!paused&&!document.hidden&&!notice.open)timer=setTimeout(()=>changeSeason(1),6000);}
function changeSeason(direction){current=(current+direction+photos.length)%photos.length;photos.forEach((photo,i)=>{photo.classList.toggle('is-current',i===current);photo.setAttribute('aria-hidden',String(i!==current));});['is-winter','is-spring','is-summer','is-autumn'].forEach((name,i)=>document.querySelector('.seasonal-home').classList.toggle(name,current===i));lockedUntil=performance.now()+(reduce.matches?250:1000);wheelSum=0;schedule();}
pause.addEventListener('click',()=>{paused=!paused;document.querySelector('.seasonal-home').classList.toggle('snow-paused',paused);pause.textContent=paused?'▷':'Ⅱ';pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Продолжить смену фотографий':'Приостановить смену фотографий');schedule();});
window.addEventListener('wheel',event=>{if(notice.open||event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY))return;event.preventDefault();const now=performance.now();if(now-lastWheel>220)wheelSum=0;lastWheel=now;if(now<lockedUntil){wheelSum=0;return;}const delta=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);if(Math.sign(delta)!==Math.sign(wheelSum))wheelSum=0;wheelSum+=delta;if(Math.abs(wheelSum)>65)changeSeason(Math.sign(wheelSum));},{passive:false});
window.addEventListener('keydown',event=>{if(notice.open||event.target.closest('button,a,input,textarea'))return;if(['ArrowDown','ArrowRight','PageDown','ArrowUp','ArrowLeft','PageUp'].includes(event.key)){event.preventDefault();changeSeason(['ArrowUp','ArrowLeft','PageUp'].includes(event.key)?-1:1);}});
const home=document.querySelector('.seasonal-home');
home.addEventListener('touchstart',event=>{if(notice.open||event.touches.length!==1)return;touchStart={x:event.touches[0].clientX,y:event.touches[0].clientY};},{passive:true});
home.addEventListener('touchend',event=>{if(!touchStart)return;const dx=event.changedTouches[0].clientX-touchStart.x,dy=event.changedTouches[0].clientY-touchStart.y;touchStart=null;if(notice.open||performance.now()<lockedUntil)return;const delta=Math.abs(dy)>Math.abs(dx)?dy:dx;if(Math.abs(delta)>50)changeSeason(delta<0?1:-1);},{passive:true});
document.addEventListener('visibilitychange',schedule);
notice.querySelector('.guest-close').onclick=notice.querySelector('.guest-confirm').onclick=()=>notice.close();
notice.addEventListener('close',()=>{document.querySelector('.home-actions a').focus({preventScroll:true});schedule();});
window.addEventListener('pageshow',schedule);
notice.showModal();
