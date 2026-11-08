'use strict';
(() => {
  const sessionKey='atelier_study_session';
  const session=parse(localStorage.getItem(sessionKey));
  const form=document.getElementById('studyForm');
  const status=document.getElementById('surveyStatus');
  const done=document.getElementById('surveyDone');
  const doneMessage=document.getElementById('doneMessage');
  const submit=document.getElementById('submitResults');
  let lastPayload=null;
  function parse(text){try{return JSON.parse(text);}catch{return null;}}
  function field(name,value){const el=form.elements.namedItem(name);if(el) el.value=String(value??'');}
  function saveFile(payload){
    const body=JSON.stringify(payload,null,2);
    const url=URL.createObjectURL(new Blob([body],{type:'application/json;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`atelier_${payload.participant_id || Date.now()}.json`;
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }
  function checkReceipt(endpoint,id){
    return new Promise(resolve=>{
      let complete=false;
      const previous=window.ATELIER_RECEIPT;
      const script=document.createElement('script');
      const finish=(received)=>{
        if(complete)return;
        complete=true;
        clearTimeout(timer);
        script.remove();
        if(previous===undefined)delete window.ATELIER_RECEIPT;
        else window.ATELIER_RECEIPT=previous;
        resolve(Boolean(received));
      };
      const timer=setTimeout(()=>finish(false),9000);
      window.ATELIER_RECEIPT=message=>{
        if(message && message.id===id)finish(message.saved===true);
      };
      script.onerror=()=>finish(false);
      const glue=endpoint.includes('?')?'&':'?';
      script.src=endpoint+glue+'receipt='+encodeURIComponent(id)+'&t='+Date.now();
      document.head.append(script);
    });
  }
  document.querySelectorAll('[data-survey-rating]').forEach(el=>{
    const name=el.dataset.surveyRating;
    el.innerHTML=Array.from({length:7},(_,i)=>`<label><input type="radio" name="${name}" value="${i+1}" required><span>${i+1}</span></label>`).join('');
  });
  if(!session){
    form.hidden=true;
    done.hidden=false;
    done.querySelector('h2').textContent='Тестирование ещё не начато';
    doneMessage.textContent='Откройте главную страницу исследования и пройдите задания перед заполнением анкеты.';
    document.getElementById('downloadBackup').hidden=true;
    return;
  }
  field('participant_id',session.id);
  field('version',session.version);
  field('assigned_at',session.assignedAt);
  field('device_width',session.deviceWidth);
  field('firstlook_beauty',session.firstLook?.beauty);
  field('firstlook_ease',session.firstLook?.ease);
  const tasks=session.tasks||[];
  let total=0;
  for(let i=0;i<3;i++){
    const t=tasks[i]||{};const duration=Number(t.duration_ms||0);total+=duration;
    field(`task_${i+1}_ms`,duration);
    field(`task_${i+1}_success`,t.success ? '1':'0');
    field(`task_${i+1}_nontarget`,Number(t.nontarget||0));
    field(`task_${i+1}_skipped`,t.skipped?'1':'0');
  }
  field('actions_count',Number(session.actions||0));field('total_ms',total);
  const backup=document.getElementById('downloadBackup');
  backup.addEventListener('click',()=>{if(lastPayload)saveFile(lastPayload);});
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(!form.reportValidity())return;
    const data=new FormData(form);
    const payload=Object.fromEntries(data.entries());
    lastPayload=payload;
    submit.disabled=true;status.textContent='Сохраняем ответы…';
    let uploaded=false;
    const endpoint=(window.ATELIER_CONFIG?.surveyEndpoint||'').trim();
    if (endpoint) {
      try {
        // Plain-text POST is a simple CORS request. The opaque response does
        // not prove that Google Sheets saved anything, so verify separately.
        await fetch(endpoint, {
          method:'POST', mode:'no-cors',
          headers:{'Content-Type':'text/plain;charset=UTF-8'},
          body:JSON.stringify(payload), cache:'no-store', keepalive:true
        });
        uploaded=await checkReceipt(endpoint,payload.participant_id);
      } catch (_) { uploaded=false; }
    }
    if(!uploaded)saveFile(payload);
    form.hidden=true;done.hidden=false;
    doneMessage.textContent=uploaded
      ? 'Ответы получены и проверены. Благодарим за участие в исследовании.'
      : 'Не получилось подтвердить сохранение на сервере. Результаты скачаны файлом JSON: пожалуйста, передайте его организатору исследования.';
    localStorage.removeItem(sessionKey);
  });
})();
