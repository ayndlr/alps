const tokenKey="leaveflow_token"; const userKey="leaveflow_user";
const $=s=>document.querySelector(s);
$("#loginForm").addEventListener("submit",async e=>{
 e.preventDefault(); const msg=$("#loginMsg"); msg.textContent="Signing in...";
 try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:$("#username").value,password:$("#password").value})});const d=await r.json();if(!r.ok)throw Error(d.message);
 localStorage.setItem(tokenKey,d.token);localStorage.setItem(userKey,JSON.stringify(d.user));
 location.href=d.user.role==="admin"?"/admin.html":"/dashboard.html";
 }catch(err){msg.textContent=err.message}
});