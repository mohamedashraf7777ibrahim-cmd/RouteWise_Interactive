(() => {
  const $ = (id) => document.getElementById(id);
  const menuBtn = $('menuBtn'), nav = $('nav');
  menuBtn.addEventListener('click', () => nav.classList.toggle('open'));
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

  // Synthetic 4x4 road graph. Weights are illustrative, not real-world distances.
  const nodes = [
    {id:'A',x:55,y:48},{id:'B',x:215,y:48},{id:'C',x:375,y:48},{id:'D',x:535,y:48},
    {id:'E',x:55,y:155},{id:'F',x:215,y:155},{id:'G',x:375,y:155},{id:'H',x:535,y:155},
    {id:'I',x:55,y:262},{id:'J',x:215,y:262},{id:'K',x:375,y:262},{id:'L',x:535,y:262},
    {id:'M',x:55,y:369},{id:'N',x:215,y:369},{id:'O',x:375,y:369},{id:'P',x:535,y:369}
  ];
  const edges = [];
  const add = (a,b,w) => edges.push({a,b,w,closed:false});
  // Horizontal connections
  [[0,1,4],[1,2,5],[2,3,4],[4,5,3],[5,6,4],[6,7,6],[8,9,5],[9,10,3],[10,11,4],[12,13,4],[13,14,6],[14,15,3]].forEach(e=>add(nodes[e[0]].id,nodes[e[1]].id,e[2]));
  // Vertical connections
  [[0,4,4],[1,5,6],[2,6,3],[3,7,5],[4,8,3],[5,9,3],[6,10,5],[7,11,3],[8,12,6],[9,13,4],[10,14,4],[11,15,5]].forEach(e=>add(nodes[e[0]].id,nodes[e[1]].id,e[2]));
  // A few diagonal streets create route choices
  [[0,5,7],[1,6,5],[2,7,7],[4,9,5],[5,10,4],[6,11,6],[8,13,7],[9,14,5],[10,15,6],[3,6,6],[9,12,6]].forEach(e=>add(nodes[e[0]].id,nodes[e[1]].id,e[2]));
  const nodeMap = Object.fromEntries(nodes.map(n=>[n.id,n]));
  const svg = $('networkSvg');
  const NS = 'http://www.w3.org/2000/svg';
  let lastPath = [], lastAlgo = 'dijkstra';
  const el = (tag, attrs={}) => { const n=document.createElementNS(NS,tag); Object.entries(attrs).forEach(([k,v])=>n.setAttribute(k,v)); return n; };
  function draw(path=[]) {
    svg.innerHTML='';
    const bg=el('rect',{x:0,y:0,width:600,height:420,fill:'#081620'});svg.appendChild(bg);
    for(let x=15;x<600;x+=20)for(let y=10;y<420;y+=20)svg.appendChild(el('circle',{cx:x,cy:y,r:1,fill:'#1a3040'}));
    const pathPairs=new Set(); for(let i=0;i<path.length-1;i++)pathPairs.add(pair(path[i],path[i+1]));
    edges.forEach((edge,idx)=>{
      const a=nodeMap[edge.a],b=nodeMap[edge.b],isRoute=pathPairs.has(pair(edge.a,edge.b));
      const line=el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'road'+(edge.closed?' closed':'')+(isRoute&&!edge.closed?' route':'')});
      line.addEventListener('click',()=>{edge.closed=!edge.closed; calculate(false);});
      const hit=el('line',{x1:a.x,y1:a.y,x2:b.x,y2:b.y,class:'edge-hit'});hit.addEventListener('click',()=>{edge.closed=!edge.closed;calculate(false);});
      svg.appendChild(line);svg.appendChild(hit);
      const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;
      if(Math.abs(a.x-b.x)>50||Math.abs(a.y-b.y)>50){const weight=el('text',{x:mx,y:my-6,fill:'#718b9b','font-size':'9','text-anchor':'middle','paint-order':'stroke','stroke':'#081620','stroke-width':'3'});weight.textContent=edge.w;svg.appendChild(weight);}
      if(edge.closed){const cross=el('text',{x:mx,y:my+4,fill:'#ff727d','font-size':'13','font-weight':'bold','text-anchor':'middle','paint-order':'stroke','stroke':'#081620','stroke-width':'3'});cross.textContent='×';svg.appendChild(cross);}
    });
    nodes.forEach(n=>{
      const g=el('g',{class:'node'+(n.id===$('startNode').value?' start':'')+(n.id===$('endNode').value?' end':'')});
      g.appendChild(el('circle',{cx:n.x,cy:n.y,r:13}));const t=el('text',{x:n.x,y:n.y+1});t.textContent=n.id;g.appendChild(t);svg.appendChild(g);
    });
  }
  function pair(a,b){return [a,b].sort().join('-');}
  function getNeighbors(id){return edges.filter(e=>!e.closed&&(e.a===id||e.b===id)).map(e=>{const to=e.a===id?e.b:e.a;return {to,w:e.w};});}
  function heuristic(a,b){const A=nodeMap[a],B=nodeMap[b];return (Math.abs(A.x-B.x)+Math.abs(A.y-B.y))/107;}
  function search(start,goal,algo){
    const dist={},prev={},visited=new Set(),open=new Set(nodes.map(n=>n.id));let explored=0;
    nodes.forEach(n=>dist[n.id]=Infinity);dist[start]=0;
    while(open.size){
      let current=null,best=Infinity;
      for(const id of open){let score=dist[id];if(algo==='astar')score+=heuristic(id,goal);if(algo==='bfs')score=dist[id];if(score<best){best=score;current=id;}}
      if(current===null||dist[current]===Infinity)break;
      open.delete(current);if(visited.has(current))continue;visited.add(current);explored++;
      if(current===goal)break;
      for(const nb of getNeighbors(current)){
        if(!open.has(nb.to))continue;
        const candidate=algo==='bfs'?dist[current]+1:dist[current]+nb.w;
        if(candidate<dist[nb.to]){dist[nb.to]=candidate;prev[nb.to]=current;}
      }
    }
    if(start!==goal&&prev[goal]===undefined)return {path:[],cost:Infinity,explored};
    const path=[];let cur=goal;path.unshift(cur);while(cur!==start){cur=prev[cur];if(cur===undefined)return {path:[],cost:Infinity,explored};path.unshift(cur);}
    const weightedCost=path.slice(1).reduce((sum,id,i)=>sum+edges.find(e=>pair(e.a,e.b)===pair(path[i],id)).w,0);
    return {path,cost:algo==='bfs'?weightedCost:dist[goal],weightedCost,explored};
  }
  function fillSelects(){['startNode','endNode'].forEach(id=>{const s=$(id);nodes.forEach((n,i)=>{const o=document.createElement('option');o.value=n.id;o.textContent=`${n.id} — ${['Northwest','North','Northeast','East','West','Central West','Central','East Central','Southwest','South West','South Central','Southeast','Lower West','South','Lower East','Southeast Gate'][i]}`;s.appendChild(o);});});$('startNode').value='A';$('endNode').value='P';}
  function calculate(showMessage=true){
    const start=$('startNode').value,goal=$('endNode').value,algo=$('algorithm').value;lastAlgo=algo;
    const result=search(start,goal,algo);lastPath=result.path;
    draw(result.path);
    const closed=edges.filter(e=>e.closed).length;$('closuresMetric').textContent=closed;$('networkState').textContent=closed?`${closed} ROAD${closed>1?'S':''} CLOSED`:'ALL ROADS OPEN';$('networkState').style.color=closed?'var(--orange)':'var(--mint)';
    if(!result.path.length){$('distanceMetric').innerHTML='— <small>units</small>';$('timeMetric').innerHTML='— <small>min</small>';$('nodesMetric').textContent=result.explored;$('routeMessage').textContent=`No available route from ${start} to ${goal}. Reopen a road or choose another destination.`;return;}
    const cost=result.weightedCost;const minutes=Math.round(cost*4.2);$('distanceMetric').innerHTML=`${cost} <small>units</small>`;$('timeMetric').innerHTML=`${minutes} <small>min</small>`;$('nodesMetric').textContent=result.explored;
    const algoName={dijkstra:'Dijkstra',bfs:'BFS',astar:'A*'}[algo];$('routeMessage').innerHTML=`<b style="color:var(--mint)">${algoName} route found:</b> ${result.path.join(' → ')} <span style="color:#91a8b7">· ${result.path.length-1} road segments · total weight ${cost}</span>`;
  }
  $('calculate').addEventListener('click',()=>calculate(true));
  $('reset').addEventListener('click',()=>{edges.forEach(e=>e.closed=false);$('startNode').value='A';$('endNode').value='P';$('algorithm').value='dijkstra';calculate();$('routeMessage').textContent='Network reset. All roads are open; calculate a route to begin.';});
  $('startNode').addEventListener('change',()=>calculate(false));$('endNode').addEventListener('change',()=>calculate(false));$('algorithm').addEventListener('change',()=>calculate(false));
  fillSelects();calculate();
})();
