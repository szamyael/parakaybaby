const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];

// --- Persistent progress/navigation ---
const navLinks = $$('#lessonNav a');
const sections = navLinks.map(a => document.getElementById(a.dataset.section)).filter(Boolean);
const progressBar = $('#progressBar');
const progressLabel = $('#progressLabel');
function updateProgress(){
  const scrollTop = window.scrollY + 150;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = Math.max(0, Math.min(100, Math.round((scrollTop / Math.max(docHeight,1))*100)));
  progressBar.style.width = pct + '%';
  progressLabel.textContent = `${pct}% complete`;
}
function updateActive(){
  const at = window.scrollY + 190;
  let active = sections[0]?.id;
  for(const sec of sections){ if(sec.offsetTop <= at) active = sec.id; }
  navLinks.forEach(a=>a.classList.toggle('active', a.dataset.section===active));
}
window.addEventListener('scroll',()=>{updateProgress();updateActive()},{passive:true});
updateProgress(); updateActive();

// --- Quality card popovers ---
$$('.quality-card').forEach(btn=>btn.addEventListener('click',()=>showToast(btn.dataset.pop)));
function showToast(message){
  const toast=$('#toast'); toast.textContent=message; toast.classList.add('show');
  clearTimeout(showToast.t); showToast.t=setTimeout(()=>toast.classList.remove('show'),3200);
}

// --- Water cycle demonstration ---
const waterStages=[
 {name:'Evaporation',annotation:'Water rises from the surface.',checks:[['Text','Check the process terms.'],['Facts','Is the explanation scientifically correct?'],['Sequence','Does evaporation appear at the right point?']]},
 {name:'Condensation',annotation:'Water cools and clouds form.',checks:[['Diagram','Are labels in the correct places?'],['Captions','Do they match the narration?'],['Visuals','Does the visual represent cloud formation?']]},
 {name:'Precipitation',annotation:'Rain falls from the clouds.',checks:[['Numbers','Are measurements correct?'],['Captions','Do captions match the explanation?'],['Sequence','Is precipitation shown after condensation?']]},
 {name:'Collection',annotation:'Water returns to the surface and collects.',checks:[['Visuals','Does the visual support the concept?'],['Audio','Can the explanation be clearly heard?'],['Sequence','Is the full cycle logical?']]}
];
let waterIndex=0, waterTimer;
function renderWater(){
 const s=waterStages[waterIndex];
 $('#waterStageLabel').textContent=`Stage ${waterIndex+1} • ${s.name}`;
 $('#waterAnnotation').textContent=s.annotation;
 $('#waterChecks').innerHTML=s.checks.map(x=>`<div class="water-check"><b>${x[0]}</b><span>${x[1]}</span></div>`).join('');
 const stage=$('#waterStage'); stage.dataset.stage=s.name.toLowerCase();
}
function stepWater(dir){ waterIndex=(waterIndex+dir+waterStages.length)%waterStages.length; renderWater(); }
$('#waterPrev').addEventListener('click',()=>stepWater(-1));
$('#waterNext').addEventListener('click',()=>stepWater(1));
$('#waterPlay').addEventListener('click',()=>{
 clearInterval(waterTimer);
 $('#waterPlay').textContent='■ Playing';
 waterTimer=setInterval(()=>{stepWater(1)},1600);
 setTimeout(()=>{clearInterval(waterTimer);$('#waterPlay').textContent='▶ Play'},6500);
});
renderWater();

// --- Technical vs video sorter ---
let selectedTask=null, sortedCount=0;
$$('.sort-task').forEach(task=>task.addEventListener('click',()=>{
 selectedTask=task;
 $$('.sort-task').forEach(t=>t.classList.remove('selected'));
 task.classList.add('selected');
 $('#sortFeedback').textContent='Now choose TECHNICAL EDITING or VIDEO EDITING.';
}));
$$('.sort-column').forEach(col=>col.addEventListener('click',()=>{
 if(!selectedTask){$('#sortFeedback').textContent='Select a task first.';return;}
 const target=col.dataset.target;
 const ok=selectedTask.dataset.answer===target;
 const item=document.createElement('span'); item.className='droped-task '+(ok?'correct-task':'wrong-task'); item.textContent=selectedTask.textContent;
 col.querySelector('.drop-zone').appendChild(item);
 if(ok){sortedCount++; $('#sortFeedback').textContent='Correct — '+(sortedCount===8?'All tasks are sorted!':'Keep going.');}
 else $('#sortFeedback').textContent='Not quite. This task belongs in the other category.';
 selectedTask.remove(); selectedTask=null;
}));

// --- Micro animation ---
$('#bounceBtn').addEventListener('click',()=>{const b=$('#microBall');b.classList.remove('bouncing');void b.offsetWidth;b.classList.add('bouncing')});

// --- Process tab panel ---
const processData={
 water:{title:'Water Cycle',text:'Animation can show the order of evaporation, rising water, cloud formation, and rain.',visual:'<div class="animated-arrow">💧 ↑ ☁ ↓ ☔</div>'},
 body:{title:'Human Body',text:'Blood traveling through every blood vessel is not easy to film directly. Animation can show the cycle: Heart → Blood vessels → Body → Heart.',visual:'<div class="body-loop">❤️ → 🩸 → 🫀</div>'},
 earthquake:{title:'Earthquake',text:'You cannot see tectonic plates moving underground with your eyes. Animation can demonstrate how plate movement can cause an earthquake.',visual:'<div class="plates">◼︎ ← → ◼︎</div>'},
 solar:{title:'Solar System',text:'Animation can illustrate planetary movement around the Sun, which is difficult to record directly as if you were standing in space.',visual:'<div class="planets">☀️ • ◦ • ◌</div>'}
};
function renderProcess(key){const p=processData[key];$('#processPanel').innerHTML=`<div class="process-layout"><div class="process-visual">${p.visual}</div><div class="process-copy"><h3>${p.title}</h3><p>${p.text}</p></div></div>`}
$$('.process-tab').forEach(btn=>btn.addEventListener('click',()=>{$$('.process-tab').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderProcess(btn.dataset.topic)}));
renderProcess('water');

// --- Safety sequence demo ---
$$('[data-safety]').forEach(btn=>btn.addEventListener('click',()=>{
 const scene=$('.safety-scene'); const step=btn.dataset.safety;
 scene.classList.remove('drop','cover');
 if(step==='DROP') scene.classList.add('drop');
 if(step==='COVER') scene.classList.add('cover');
 $('#safetyInstruction').textContent=step;
 $('#safetyCaption').textContent=step==='DROP'?'Get down.':step==='COVER'?'Protect your head and neck.':'Hold onto your shelter.';
}));

// --- Vector scaling ---
$('#vectorScale').addEventListener('input',e=>{
 const v=Number(e.target.value); $('#vectorArrow').style.fontSize=Math.round(v*.82)+'px';$('#vectorScaleLabel').textContent=v+'%';$('#vectorSharpness').textContent=v>180?'Still sharp: vector graphics can generally be enlarged without losing sharpness.':'Sharp at every scale.';
});

// --- Connection nodes ---
const connectionText={
 vector:'VECTOR creates the visual ingredients: tectonic plate shapes, arrows, labels, and a fault-line diagram.',
 technical:'TECHNICAL EDITING checks labels, scientific accuracy, diagram accuracy, and whether the explanation is understandable.',
 animation:'ANIMATION makes the plates move, arrows show direction, the fault line shifts, and important terms appear.'
};
$$('[data-connection]').forEach(btn=>btn.addEventListener('click',()=>{$$('.connection-node').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$('#connectionDetail').textContent=connectionText[btn.dataset.connection]}));

// --- Formula cards ---
$$('.formula-card').forEach(btn=>btn.addEventListener('click',()=>{$$('.formula-card').forEach(b=>b.classList.remove('active'));btn.classList.add('active');$('#formulaDetail').textContent=btn.dataset.formula}));

// --- Recycling timeline ---
const recyclingData={
1:'<div class="recycling-content"><div class="recycling-symbol">♻</div><div class="key-message">Why should we recycle?</div><p>A vector recycling symbol provides the visual symbol.</p></div>',
2:'<div class="recycling-content"><div class="recycle-bins"><div class="bin">PAPER</div><div class="bin">PLASTIC</div><div class="bin">GLASS</div></div><p>Technical editing checks that labels and information are correct.</p></div>',
3:'<div class="recycling-content"><div class="bottle">🧴</div><p>Animation shows the action: the plastic bottle moves toward the correct recycling bin.</p></div>',
4:'<div class="recycling-content"><div class="key-message"><span class="highlight">Recycling helps reduce waste.</span></div><p>Editing + animation make the information clear and emphasize the key message.</p></div>'
};
function renderRecycle(n){$('#recyclingStage').innerHTML=recyclingData[n];}
$$('.timeline-step').forEach(btn=>btn.addEventListener('click',()=>{$$('.timeline-step').forEach(b=>b.classList.remove('active'));btn.classList.add('active');renderRecycle(btn.dataset.scene)}));
renderRecycle('1');

// --- Volcano complete example ---
const volcanoText={vector:'Clean diagram: Magma chamber → Volcano → Crater, with arrows showing direction.',technical:'Check terminology, labels, scientific explanation, diagram accuracy, captions, and sequence of information.',animation:'Animate magma rising, then show pressure increasing, then eruption. The audience sees the process.',video:'Cut unnecessary footage, place the animation correctly, adjust narration, add captions, and use appropriate transitions.'};
$$('[data-volcano]').forEach(btn=>btn.addEventListener('click',()=>{
 $$('.story-step').forEach(b=>b.classList.remove('active')); btn.classList.add('active');
 const key=btn.dataset.volcano; $('#volcanoCaption').textContent=volcanoText[key];
 const sc=$('.volcano-scene'); sc.classList.remove('animate','erupt','video');
 if(key==='animation'){sc.classList.add('animate','erupt')}; if(key==='video'){sc.classList.add('video','erupt')};
}));

// --- Surprise question engine ---
const surpriseQs=[
 {q:'A documentary uses an animated arrow to show the direction of evaporation. What is the clearest purpose of the animation?',o:['To decorate the background','To help explain movement or process','To make every element move','To replace all technical editing'],a:1,e:'The lesson says good animation supports understanding by showing movement, change, sequence, or process.'},
 {q:'Which question best matches Technical Editing?',o:['How should the clips be arranged?','Does the movement help us understand?','Is the information correct and clear?','Which transition looks coolest?'],a:2,e:'Technical Editing checks accuracy, clarity, consistency, organization, and appropriateness.'},
 {q:'Which statement about vectors matches the lesson?',o:['They are only for photographs.','They generally stay sharp when enlarged or reduced.','They always need animation.','They are the same thing as video editing.'],a:1,e:'The lesson identifies scalability without losing sharpness as a major advantage.'},
 {q:'A video has flashing backgrounds, spinning text, and bouncing titles with no explanatory purpose. What is the lesson warning about?',o:['Too little audio','Overuse of animation','Missing vector graphics','Lack of captions'],a:1,e:'Animation should help explain the message, not simply decorate the video.'}
];
let surpriseIndex=0;
function openSurprise(){
 const data=surpriseQs[Math.floor(Math.random()*surpriseQs.length)]; surpriseIndex=data; const modal=$('#surpriseModal');
 $('#surpriseQuestion').textContent=data.q; $('#surpriseTitle').textContent='Pause & think'; $('#surpriseFeedback').textContent='';
 $('#surpriseOptions').innerHTML=data.o.map((x,i)=>`<button class="surprise-option" data-i="${i}" type="button">${x}</button>`).join('');
 $$('.surprise-option','#surpriseOptions').forEach(btn=>btn.addEventListener('click',()=>{
   const i=Number(btn.dataset.i); $$('.surprise-option','#surpriseOptions').forEach(b=>b.disabled=true);
   if(i===data.a){btn.classList.add('correct');$('#surpriseFeedback').textContent='✓ Correct. '+data.e}
   else{btn.classList.add('wrong');$('#surpriseFeedback').textContent='Not quite. '+data.e;$$('.surprise-option','#surpriseOptions')[data.a].classList.add('correct')}
 }));
 modal.hidden=false;
}
$('#surpriseTopBtn').addEventListener('click',openSurprise);$('#surpriseHeroBtn').addEventListener('click',openSurprise);$('#closeSurprise').addEventListener('click',()=>$('#surpriseModal').hidden=true);$('.modal-backdrop').addEventListener('click',()=>$('#surpriseModal').hidden=true);

// --- Quiz ---
const quiz=[
 {q:'What is the main concern of technical editing?',o:['Making every scene exciting','Making information correct, clear, organized, and appropriate','Adding more transitions','Making a soundtrack'],a:1,e:'Technical editing focuses on specialized information and how clearly and correctly it is communicated.'},
 {q:'Which is an example of video editing?',o:['Checking scientific terminology','Checking measurements','Cutting unnecessary footage','Checking diagram accuracy'],a:2,e:'Video editing includes cutting footage, arranging clips, adjusting audio, adding captions, images, and effects.'},
 {q:'Why is animation useful in informational texts?',o:['Only to entertain','To show processes, movement, changes, or relationships','To replace narration in every case','To make visuals decorative'],a:1,e:'The lesson explains that animation can help show difficult-to-film processes and sequences.'},
 {q:'Which is a type of animation discussed in the lesson?',o:['Motion graphics','Password animation','Spreadsheet animation','Database animation'],a:0,e:'The lesson lists motion graphics, animated diagrams, character animation, and text animation.'},
 {q:'What should good animation do?',o:['Move everything constantly','Support understanding','Flash on every sentence','Distract the audience'],a:1,e:'The lesson states: good animation supports understanding.'},
 {q:'What do vectors help create?',o:['Clear, scalable visual elements','Only audio tracks','Only video cuts','Only captions'],a:0,e:'Vectors can create arrows, icons, diagrams, charts, symbols, and technical illustrations.'},
 {q:'What is the easy memory formula?',o:['CUT → MIX → POST','SHOW IT → MOVE IT → CHECK IT','DRAW → DELETE → EXPORT','WRITE → TALK → SING'],a:1,e:'The lesson presents VECTOR = SHOW IT, ANIMATION = MOVE IT, TECHNICAL EDITING = CHECK IT.'},
 {q:'In the complete volcano example, what happens after technical editing?',o:['The creator animates magma, pressure, and eruption.','The creator deletes the diagram.','The creator stops checking labels.','The creator adds random movement.'],a:0,e:'The four elements work together: vector builds the visual, technical editing checks it, animation shows the process, and video editing arranges the presentation.'}
];
function buildQuiz(){
 $('#quizForm').innerHTML=quiz.map((item,qi)=>`<fieldset class="quiz-question" data-q="${qi}"><h3>${qi+1}. ${item.q}</h3><div class="quiz-options">${item.o.map((x,oi)=>`<label class="quiz-option"><input type="radio" name="q${qi}" value="${oi}"><span>${x}</span></label>`).join('')}</div><div class="quiz-explanation" hidden></div></fieldset>`).join('');
}
buildQuiz();
$('#submitQuiz').addEventListener('click',()=>{
 let score=0,answered=0;
 quiz.forEach((item,qi)=>{const box=$(`.quiz-question[data-q="${qi}"]`);const chosen=$(`input[name="q${qi}"]:checked`);const exp=$('.quiz-explanation',box);box.classList.remove('correct','incorrect');if(chosen){answered++;if(Number(chosen.value)===item.a){score++;box.classList.add('correct')}else box.classList.add('incorrect')}exp.hidden=false;exp.textContent=(chosen&&Number(chosen.value)===item.a?'✓ Correct. ':'✗ Review. ')+item.e;});
 const pct=Math.round((score/quiz.length)*100);$('#quizResult').innerHTML=`<div class="result-card"><b>${score}/${quiz.length}</b><span>${pct}% • ${answered===quiz.length?'All questions answered.':'Some questions were left unanswered.'}</span></div>`;
 $('#quizResult').scrollIntoView({behavior:'smooth',block:'nearest'});
});
$('#resetQuiz').addEventListener('click',()=>{buildQuiz();$('#quizResult').textContent=''});

// --- Storyboard studio ---
const scenePrompts=[
 {n:1,title:'Hook / Question',visual:'What vector, icon, diagram, or label will SHOW IT?',motion:'What will MOVE IT in this scene?',check:'What will you CHECK for accuracy and clarity?'},
 {n:2,title:'Explain',visual:'What visual helps the audience understand the idea?',motion:'What movement or sequence helps explain it?',check:'Are terms, labels, and captions correct?'},
 {n:3,title:'Demonstrate',visual:'What diagram, symbol, character, or chart appears?',motion:'What action or process should the viewer see?',check:'Does the animation represent the information correctly?'},
 {n:4,title:'Key Message / Close',visual:'What visual reinforces the message?',motion:'Should the key statement appear or move?',check:'Is the final presentation organized and appropriate for the audience?'}
];
function buildStoryboard(saved={}){
 $('#storyboardGrid').innerHTML=scenePrompts.map(s=>{
  const v=saved[`s${s.n}v`]||'',m=saved[`s${s.n}m`]||'',c=saved[`s${s.n}c`]||'';
  return `<article class="scene-card"><div class="scene-head"><div><div class="scene-title">${s.title}</div><span class="scene-hint">Scene ${s.n}</span></div><div class="scene-number">${s.n}</div></div><div class="scene-stack"><label>SHOW IT — visual<input data-key="s${s.n}v" type="text" value="${escapeAttr(v)}" placeholder="e.g., vector recycling symbol" /></label><span class="scene-hint">${s.visual}</span><label>MOVE IT — animation<textarea data-key="s${s.n}m" placeholder="Describe the movement or sequence.">${escapeHtml(m)}</textarea></label><span class="scene-hint">${s.motion}</span><label>CHECK IT — technical editing<input data-key="s${s.n}c" type="text" value="${escapeAttr(c)}" placeholder="e.g., verify labels and explanation" /></label><span class="scene-hint">${s.check}</span><label class="checkline"><input data-done="s${s.n}d" type="checkbox" ${saved[`s${s.n}d`]?'checked':''}> Scene reviewed</label></div></article>`;
 }).join('');
}
function escapeHtml(x){return String(x).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}
function escapeAttr(x){return escapeHtml(x).replaceAll('"','&quot;')}
function readStoryboard(){
 const data={title:$('#projectTitle').value,audience:$('#targetAudience').value};
 $$('[data-key]').forEach(el=>data[el.dataset.key]=el.value); $$('[data-done]').forEach(el=>data[el.dataset.done]=el.checked); return data;
}
function saveStoryboard(){localStorage.setItem('visualStoriesStoryboard',JSON.stringify(readStoryboard()));$('#storyboardStatus').textContent='Saved in this browser. Your storyboard will be there when you return.'}
function loadStoryboard(){try{const s=JSON.parse(localStorage.getItem('visualStoriesStoryboard')||'{}');$('#projectTitle').value=s.title||'';$('#targetAudience').value=s.audience||'';buildStoryboard(s)}catch{buildStoryboard({})}}
$('#saveStoryboard').addEventListener('click',saveStoryboard);
$('#clearStoryboard').addEventListener('click',()=>{localStorage.removeItem('visualStoriesStoryboard');$('#projectTitle').value='';$('#targetAudience').value='';buildStoryboard({});$('#storyboardStatus').textContent='Storyboard cleared.'});
$('#printStoryboard').addEventListener('click',()=>{saveStoryboard();window.print()});
loadStoryboard();

// Auto surprise after a meaningful lesson milestone, once per browser session.
setTimeout(()=>{if(!sessionStorage.getItem('vs-surprise-seen')){sessionStorage.setItem('vs-surprise-seen','1');openSurprise()}},22000);
