(() => {
const f=document.getElementById('banquet-form');if(!f)return;
const fields=document.getElementById('banquet-form-fields'),button=f.querySelector('[type=submit]'),status=document.getElementById('banquet-status'),endpoint=f.dataset.endpoint.trim();
let token='',widget=null,busy=false,clientId=crypto.randomUUID();
f.elements.date.min=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
const sync=()=>{button.disabled=busy||!token||fields.disabled||!endpoint};
const reset=()=>{token='';sync();if(widget!==null&&window.turnstile)window.turnstile.reset(widget)};
window.initBanquetTurnstile=()=>{
 if(widget!==null||!endpoint)return;
 widget=window.turnstile.render('#banquet-challenge',{sitekey:'0x4AAAAAAGUpMNKDTIg5WLeM',action:'website_banquet',theme:'light',size:'flexible',callback:t=>{token=t;sync();if(status.dataset.challengeError){status.textContent='';delete status.dataset.challengeError}},'expired-callback':()=>{token='';sync()},'error-callback':()=>{token='';sync();status.dataset.challengeError='1';status.textContent='Не удалось выполнить проверку безопасности. Обновите страницу или позвоните в ресторан.'}});
 fields.disabled=false;sync();
};
document.querySelectorAll('[data-banquet-hall]').forEach(link=>link.addEventListener('click',()=>{if(busy)return;f.elements.hall.value=link.dataset.banquetHall;clientId=crypto.randomUUID()}));
f.addEventListener('input',e=>{if(e.target.name==='phone')e.target.setCustomValidity('');if(e.target.name&&e.target.name!=='cf-turnstile-response')clientId=crypto.randomUUID()});
f.addEventListener('change',e=>{if(e.target.name&&e.target.name!=='cf-turnstile-response'&&!busy)clientId=crypto.randomUUID()});
f.addEventListener('submit',async e=>{
 e.preventDefault();if(busy||!token||fields.disabled||!endpoint||!f.reportValidity())return;
 const phone=f.elements.phone.value.trim();if(!/^\+?[\d ()-]+$/.test(phone)||phone.replace(/\D/g,'').length<10||phone.replace(/\D/g,'').length>15){f.elements.phone.setCustomValidity('Проверьте номер телефона.');f.elements.phone.reportValidity();return}
 const body={kind:'banquet',name:f.elements.name.value.trim(),phone,date:f.elements.date.value,guests:Number(f.elements.guests.value),event_type:f.elements.event_type.value,hall:f.elements.hall.value,comment:f.elements.comment.value.trim(),consent:f.elements.consent.checked,clientId,token};
 if(!body.name||!body.consent){status.textContent='Проверьте имя и согласие на обработку данных.';return}
 busy=true;fields.disabled=true;sync();status.textContent='Отправляем заявку…';
 try{const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',body:JSON.stringify(body)});const d=await r.json();if(!r.ok||d.ok!==true)throw Error(d.error||'Не удалось отправить заявку.');f.reset();clientId=crypto.randomUUID();status.textContent='Заявка отправлена. Ожидайте связи с администратором.'}
 catch(err){status.textContent=err.message==='Failed to fetch'?'Не удалось связаться с сервером. Попробуйте ещё раз или позвоните в ресторан.':(err.message||'Не удалось отправить заявку. Попробуйте ещё раз.')}
 finally{busy=false;fields.disabled=false;reset()}
});
setTimeout(()=>{if(widget===null){status.dataset.challengeError='1';status.textContent='Не удалось загрузить проверку безопасности. Позвоните в ресторан.'}},12000);
})();
