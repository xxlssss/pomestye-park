const dialog=document.querySelector('dialog');
const titles={booking:'Бронирование стола',deposit:'Депозит',menu:'Меню',events:'Заказать мероприятие'};
document.querySelectorAll('[data-service]').forEach(button=>button.onclick=()=>{document.querySelector('#dialog-title').textContent=titles[button.dataset.service];dialog.showModal();});
dialog.querySelector('.close').onclick=dialog.querySelector('.ok').onclick=()=>dialog.close();
