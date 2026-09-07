const TOKEN_KEY="leaveflow_token"; const USER_KEY="leaveflow_user";
const token=()=>localStorage.getItem(TOKEN_KEY);
async function api(url, options={}) {
 options.headers={...(options.headers||{}),Authorization:`Bearer ${token()}`,"Content-Type":"application/json"};
 const r=await fetch(url,options); const d=await r.json().catch(()=>({}));
 if(r.status===401){localStorage.clear();location.href="/";}
 if(!r.ok) throw Error(d.message||"Request failed"); return d;
}
function closeSidebar(){
 const sidebar=document.querySelector(".sidebar");
 const backdrop=document.querySelector("#sidebarBackdrop");
 sidebar?.classList.remove("open");
 backdrop?.classList.remove("open");
}
function setupNavigation(){
 document.querySelectorAll("[data-page]").forEach(b=>b.onclick=()=>{showPage(b.dataset.page);closeSidebar();});
 document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>{showPage(b.dataset.go);closeSidebar();});
 document.querySelector("#logout").onclick=()=>{localStorage.clear();location.href="/";}
 document.querySelector("#menu")?.addEventListener("click",()=>{
   document.querySelector(".sidebar")?.classList.toggle("open");
   document.querySelector("#sidebarBackdrop")?.classList.toggle("open");
 });
 document.querySelector("#sidebarClose")?.addEventListener("click",closeSidebar);
 document.querySelector("#sidebarBackdrop")?.addEventListener("click",closeSidebar);
 document.addEventListener("keydown",e=>{if(e.key==="Escape")closeSidebar();});
}
function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("hidden",p.id!==id));
 document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
}
function fmtDate(x){return new Date(x).toLocaleDateString(undefined,{year:"numeric",month:"short",day:"numeric"});}
function badge(s){return `<span class="badge ${s}">${s}</span>`;}