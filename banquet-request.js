(() => {
  const form = document.getElementById('banquet-form');
  if (!form) return;
  const status = document.getElementById('banquet-status');
  const button = form.querySelector('button[type=submit]');
  const endpoint = form.dataset.endpoint.trim();
  const date = form.elements.date;
  date.min = new Date().toLocaleDateString('sv-SE',{timeZone:'Europe/Moscow'});
  document.querySelectorAll('[data-banquet-hall]').forEach(link => {
    link.addEventListener('click', () => { form.elements.hall.value = link.dataset.banquetHall; });
  });
  form.elements.phone.addEventListener('input', () => form.elements.phone.setCustomValidity(''));
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!endpoint) return;
    if (!form.reportValidity()) return;
    const digits = form.elements.phone.value.replace(/\D/g,'');
    if (digits.length < 10 || digits.length > 15) {
      form.elements.phone.setCustomValidity('Проверьте номер телефона.');
      form.elements.phone.reportValidity();
      return;
    }
    button.disabled = true;
    status.textContent = 'Отправляем заявку…';
    try {
      const payload = Object.fromEntries(new FormData(form));
      const response = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'omit'});
      const data = await response.json();
      if (!response.ok || data.ok !== true) throw new Error('Delivery not confirmed');
      form.reset();
      status.textContent = 'Спасибо! Ваша заявка принята. Администратор свяжется с вами для обсуждения мероприятия.';
    } catch {
      status.textContent = 'Не удалось отправить заявку. Попробуйте ещё раз или позвоните в ресторан.';
    } finally { button.disabled = false; }
  });
  if (endpoint) {
    document.getElementById('banquet-form-fields').disabled = false;
    button.disabled = false;
    document.getElementById('banquet-preview').hidden = true;
  }
})();
