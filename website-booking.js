(() => {
const f=document.getElementById('website-booking-form');if(!f)return;
const fields=document.getElementById('website-booking-fields'),button=f.querySelector('[type=submit]'),status=document.getElementById('website-booking-status');
let token='',widget=null,busy=false,clientId=crypto.randomUUID();
const today=()=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
f.elements.date.min=today();f.elements.date.value=today();
const sync=()=>{button.disabled=busy||!token||fields.disabled};
const resetChallenge=()=>{token='';sync();if(widget!==null&&window.turnstile)window.turnstile.reset(widget)};
window.initWebBookingTurnstile=()=>{
 if(widget!==null)return;
 widget=window.turnstile.render('#website-booking-challenge',{sitekey:'0x4AAAAAAGUpMNKDTIg5WLeM',action:'website_booking',theme:'dark',size:'flexible',callback:t=>{token=t;sync();if(status.dataset.challengeError){status.textContent='';delete status.dataset.challengeError}},'expired-callback':()=>{token='';sync()},'error-callback':()=>{token='';sync();status.dataset.challengeError='1';status.textContent='Не удалось выполнить проверку безопасности. Обновите страницу или воспользуйтесь Telegram.'}});
 fields.disabled=false;sync();
};
f.querySelectorAll('[data-count]').forEach(b=>b.addEventListener('click',()=>{f.elements.guests.value=String(Math.max(1,Math.min(20,(Number(f.elements.guests.value)||2)+Number(b.dataset.count))));clientId=crypto.randomUUID()}));
f.addEventListener('input',e=>{if(e.target.name==='phone')e.target.setCustomValidity('');if(e.target.name&&e.target.name!=='cf-turnstile-response')clientId=crypto.randomUUID()});
f.addEventListener('submit',async e=>{
 e.preventDefault();if(busy||!token||fields.disabled||!f.reportValidity())return;
 const phone=f.elements.phone.value.trim();if(!/^\+?[\d ()-]+$/.test(phone)||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15){f.elements.phone.setCustomValidity('Проверьте номер телефона');f.elements.phone.reportValidity();return}
 const body={kind:'booking',date:f.elements.date.value,time:f.elements.time.value,guests:Number(f.elements.guests.value),name:f.elements.name.value.trim(),phone,consent:f.elements.consent.checked,clientId,token};
 if(!body.name||!body.consent){status.textContent='Проверьте имя и согласие на обработку данных.';return}
 busy=true;fields.disabled=true;sync();status.textContent='Отправляем заявку…';
 try{const r=await fetch(f.dataset.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(body)});const d=await r.json();if(!r.ok||d.ok!==true)throw Error(d.error||'Не удалось отправить заявку.');f.reset();f.elements.date.value=today();clientId=crypto.randomUUID();status.textContent='Благодарим за заявку! Администратор свяжется с вами для подтверждения бронирования.'}
 catch(err){status.textContent=err.message==='Failed to fetch'?'Не удалось связаться с сервером. Попробуйте ещё раз или воспользуйтесь Telegram.':(err.message||'Не удалось отправить заявку. Попробуйте ещё раз.')}
 finally{busy=false;fields.disabled=false;resetChallenge()}
});
setTimeout(()=>{if(widget===null){status.dataset.challengeError='1';status.textContent='Не удалось загрузить проверку безопасности. Воспользуйтесь Telegram или позвоните в ресторан.'}},12000);
})();
