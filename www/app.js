const $=id=>document.getElementById(id);
const STORAGE_KEY="mr-sales-manager-records-v1";
const ADMIN_UIDS=["oqLhQp7pgVUBWFAwLFfjgIg3v2r1","iGYHyUYQKEbICfzY7VDt9HMWcEi1"];
let records=loadRecords(),onlineOrders={},productCosts={},toastTimer,ordersRef=null,costsRef=null;
function loadRecords(){try{const v=JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");return Array.isArray(v)?v:[]}catch{return[]}}
function saveRecords(){localStorage.setItem(STORAGE_KEY,JSON.stringify(records))}
function money(value){return "৳"+Number(value||0).toLocaleString("bn-BD",{maximumFractionDigits:2})}
function number(value){return Number(value||0)}
function today(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function profit(){return number($("saleAmount").value)-number($("costAmount").value)}
function updatePreview(){$("profitPreview").textContent=money(profit());$("profitPreview").classList.toggle("negative",profit()<0)}
function showToast(message){const el=$("toast");el.textContent=message;el.classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove("show"),2400)}
function safe(value){return String(value??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function itemList(order){return Array.isArray(order.items)?order.items:[]}
function orderSale(order){return number(order.subtotal||itemList(order).reduce((s,i)=>s+number(i.price??i.productPrice??i.unitPrice)*number(i.qty||i.quantity||1),0))}
function orderCost(order){return itemList(order).reduce((sum,item)=>{const key=String(item.id||item.name||item.productName||"");return sum+number(productCosts[key])*number(item.qty||item.quantity||1)},0)}
function deliveredOrders(){return Object.entries(onlineOrders).filter(([,o])=>String(o.status||"Pending").toLowerCase()==="delivered")}
function summary(){
 const manualSales=records.reduce((s,r)=>s+number(r.sale),0),manualCost=records.reduce((s,r)=>s+number(r.cost),0);
 const delivered=deliveredOrders();const webSales=delivered.reduce((s,[,o])=>s+orderSale(o),0),webCost=delivered.reduce((s,[,o])=>s+orderCost(o),0);
 $("totalSales").textContent=money(manualSales+webSales);$("totalCost").textContent=money(manualCost+webCost);$("totalProfit").textContent=money(manualSales+webSales-manualCost-webCost);
 $("recordCount").textContent=(records.length+Object.keys(onlineOrders).length).toLocaleString("bn-BD")+" টি";
}
function visibleRecords(){const q=$("searchInput").value.trim().toLocaleLowerCase(),month=$("filterDate").value;return [...records].filter(r=>(!q||(r.name+" "+r.phone+" "+(r.product||"")).toLocaleLowerCase().includes(q))&&(!month||r.date.startsWith(month))).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt-a.createdAt)}
function render(){
 summary();const list=visibleRecords();$("visibleCount").textContent=list.length.toLocaleString("bn-BD")+" টি ম্যানুয়াল রেকর্ড";
 if(!list.length){$("recordsBody").innerHTML='<tr><td colspan="6" class="empty">কোনো ম্যানুয়াল রেকর্ড নেই।</td></tr>';$("mobileRecords").innerHTML='<div class="empty">কোনো ম্যানুয়াল রেকর্ড নেই।</div>'}
 else{
 $("recordsBody").innerHTML=list.map(r=>'<tr><td><strong>'+safe(r.name)+'</strong><br><span class="record-phone">'+safe(r.phone)+'</span><br><small>'+safe(r.product||"")+'</small></td><td>'+safe(r.date)+'</td><td class="money">'+money(r.sale)+'</td><td class="money">'+money(r.cost)+'</td><td class="money positive">'+money(number(r.sale)-number(r.cost))+'</td><td><div class="action-cell"><button class="mini-btn" data-edit="'+r.id+'">এডিট</button><button class="mini-btn delete-btn" data-delete="'+r.id+'">মুছুন</button></div></td></tr>').join("");
 $("mobileRecords").innerHTML=list.map(r=>'<article class="record-card"><div class="record-top"><div><div class="record-name">'+safe(r.name)+'</div><span class="record-phone">'+safe(r.phone)+'</span><span class="record-date">'+safe(r.date)+' · '+safe(r.product||"")+'</span><small>'+safe(r.address||"")+'</small></div><div class="record-profit">'+money(number(r.sale)-number(r.cost))+'<span class="record-date">লাভ</span></div></div><div class="record-grid"><div><span>বিক্রি</span><b>'+money(r.sale)+'</b></div><div><span>কেনা</span><b>'+money(r.cost)+'</b></div><div><span>লাভ</span><b class="positive">'+money(number(r.sale)-number(r.cost))+'</b></div></div><div class="record-actions"><button class="mini-btn" data-edit="'+r.id+'">এডিট</button><button class="mini-btn delete-btn" data-delete="'+r.id+'">মুছুন</button></div></article>').join("");
 }
 renderOnlineOrders();
}
function renderOnlineOrders(){
 const host=$("onlineOrders");if(!host)return;
 const entries=Object.entries(onlineOrders).sort((a,b)=>number(b[1].createdAt)-number(a[1].createdAt));
 if(!window.firebase?.apps?.length){host.innerHTML='<p class="empty">অনলাইন অর্ডার সংযোগ প্রস্তুত নয়।</p>';return}
 if(!entries.length){host.innerHTML='<p class="empty">ওয়েবসাইটে এখনো কোনো অর্ডার পাওয়া যায়নি।</p>';return}
 host.innerHTML=entries.map(([id,o])=>{
 const items=itemList(o),sale=orderSale(o),cost=orderCost(o),missing=items.some(i=>!Object.prototype.hasOwnProperty.call(productCosts,String(i.id||i.name||i.productName||"")));
 const itemHtml=items.map(i=>{const key=String(i.id||i.name||i.productName||"");return '<div class="online-item"><span>'+safe(i.name||i.productName||"পণ্য")+' × '+number(i.qty||i.quantity||1)+'</span><label>প্রতি পিস কেনা ৳ <input type="number" min="0" step="0.01" value="'+(Object.prototype.hasOwnProperty.call(productCosts,key)?number(productCosts[key]):"")+'" data-cost-key="'+safe(key)+'" placeholder="খরচ লিখুন"></label></div>'}).join("");
 return '<article class="online-card"><div class="online-head"><div><b>'+safe(o.customerName||o.name||"কাস্টমার")+'</b><small>'+safe(o.phone||o.mobile||"")+' · '+new Date(number(o.createdAt)||Date.now()).toLocaleDateString("bn-BD")+'</small></div><span class="status-pill">'+safe(o.status||"Pending")+'</span></div><p class="online-address">ঠিকানা: '+safe(o.address||"উল্লেখ নেই")+'</p>'+itemHtml+'<div class="online-totals"><span>পণ্যের বিক্রি <b>'+money(sale)+'</b></span><span>পণ্যের কেনা <b>'+money(cost)+'</b></span><span>লাভ <b>'+money(sale-cost)+'</b></span></div>'+(missing?'<small class="cost-hint">লাভের হিসাব সম্পূর্ণ করতে প্রতিটি পণ্যের কেনা দাম লিখে সেভ করুন।</small>':'')+'</article>';
 }).join("");
}
function resetForm(){$("salesForm").reset();$("editId").value="";$("saleDate").value=today();$("formTitle").textContent="নতুন বিক্রির তথ্য";$("saveBtn").textContent="＋ তথ্য সেভ করুন";$("cancelEdit").classList.add("hidden");updatePreview()}
function editRecord(id){const r=records.find(x=>x.id===id);if(!r)return;$("editId").value=r.id;$("customerName").value=r.name;$("customerPhone").value=r.phone;$("productName").value=r.product||"";$("customerAddress").value=r.address||"";$("saleAmount").value=r.sale;$("costAmount").value=r.cost;$("saleDate").value=r.date;$("note").value=r.note||"";$("formTitle").textContent="বিক্রির তথ্য পরিবর্তন";$("saveBtn").textContent="পরিবর্তন সেভ করুন";$("cancelEdit").classList.remove("hidden");updatePreview();$("entryPanel").scrollIntoView({behavior:"smooth",block:"start"})}
$("salesForm").addEventListener("submit",e=>{e.preventDefault();const id=$("editId").value;const item={id:id||String(Date.now())+Math.random().toString(16).slice(2,6),name:$("customerName").value.trim(),phone:$("customerPhone").value.trim(),product:$("productName").value.trim(),address:$("customerAddress").value.trim(),sale:number($("saleAmount").value),cost:number($("costAmount").value),date:$("saleDate").value,note:$("note").value.trim(),createdAt:Date.now()};if(item.sale<0||item.cost<0){showToast("টাকার পরিমাণ ০ বা তার বেশি দিন");return}if(id){records=records.map(r=>r.id===id?item:r);showToast("তথ্য আপডেট হয়েছে")}else{records.push(item);showToast("নতুন বিক্রির তথ্য সেভ হয়েছে")}saveRecords();resetForm();render()});
$("recordsBody").addEventListener("click",handleRecordAction);$("mobileRecords").addEventListener("click",handleRecordAction);
function handleRecordAction(e){const edit=e.target.closest("[data-edit]"),del=e.target.closest("[data-delete]");if(edit)editRecord(edit.dataset.edit);if(del){const r=records.find(x=>x.id===del.dataset.delete);if(r&&confirm(r.name+" - এর রেকর্ডটি মুছে ফেলবেন?")){records=records.filter(x=>x.id!==r.id);saveRecords();render();showToast("রেকর্ড মুছে ফেলা হয়েছে")}}}
$("cancelEdit").onclick=resetForm;["saleAmount","costAmount"].forEach(id=>$(id).addEventListener("input",updatePreview));$("searchInput").addEventListener("input",render);$("filterDate").addEventListener("change",render);$("clearFilter").onclick=()=>{$("searchInput").value="";$("filterDate").value="";render()};
$("clearAll").onclick=()=>{if(records.length&&confirm("শুধু এই ডিভাইসের ম্যানুয়াল হিসাব মুছে ফেলবেন? ওয়েবসাইটের অর্ডার মুছবে না.")){records=[];saveRecords();render();resetForm();showToast("ম্যানুয়াল হিসাব মুছে ফেলা হয়েছে")}};
$("exportBtn").onclick=()=>{const rows=[["Customer Name","Mobile Number","Product","Address","Sale Amount","Product Cost","Profit","Date","Note"],...records.map(r=>[r.name,r.phone,r.product||"",r.address||"",r.sale,r.cost,number(r.sale)-number(r.cost),r.date,r.note||""])];const csv="\uFEFF"+rows.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(",")).join("\r\n");const blob=new Blob([csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="mr-sales-records-"+today()+".csv";a.click();URL.revokeObjectURL(url);showToast("CSV ফাইল তৈরি হয়েছে")};
$("onlineOrders").addEventListener("change",async e=>{const input=e.target.closest("[data-cost-key]");if(!input)return;const key=input.dataset.costKey,val=Number(input.value);if(!key||!Number.isFinite(val)||val<0){showToast("সঠিক কেনা দাম লিখুন");return}productCosts[key]=val;try{await firebase.database().ref("settings/salesManagerProductCosts").set(productCosts);showToast("পণ্যের কেনা দাম সেভ হয়েছে");render()}catch(err){showToast("সেভ হয়নি: "+err.message)}});
function setupFirebase(){
 const config={apiKey:"AIzaSyD7ThTpHXOltyqDng_aTwXn3t35vxcR5VM",authDomain:"jsf-fashion.firebaseapp.com",databaseURL:"https://jsf-fashion-default-rtdb.firebaseio.com",projectId:"jsf-fashion",storageBucket:"jsf-fashion.firebasestorage.app",messagingSenderId:"545355825847",appId:"1:545355825847:web:49f701a22e68daa9298332"};
 if(!window.firebase){$("syncStatus").textContent="Firebase SDK লোড হয়নি";return}
 if(!firebase.apps.length)firebase.initializeApp(config);
 const auth=firebase.auth(),db=firebase.database();
 $("loginForm").addEventListener("submit",async e=>{e.preventDefault();$("loginMessage").textContent="লগইন হচ্ছে...";try{await auth.signInWithEmailAndPassword($("loginEmail").value.trim(),$("loginPassword").value)}catch(err){$("loginMessage").textContent="লগইন হয়নি: "+err.message}});
 $("logoutBtn").onclick=()=>auth.signOut();
 auth.onAuthStateChanged(async user=>{
  if(ordersRef){ordersRef.off();ordersRef=null}if(costsRef){costsRef.off();costsRef=null}
  if(!user){$("loginPanel").hidden=false;$("logoutBtn").hidden=true;$("syncStatus").textContent="ওয়েবসাইটের অর্ডার দেখতে অ্যাডমিন লগইন করুন";onlineOrders={};productCosts={};render();return}
  if(!ADMIN_UIDS.includes(user.uid)){await auth.signOut();$("loginMessage").textContent="এই অ্যাকাউন্টটি JSF FASHION অ্যাডমিন অ্যাকাউন্ট নয়।";return}
  $("loginPanel").hidden=true;$("logoutBtn").hidden=false;$("syncStatus").textContent="JSF FASHION-এর সঙ্গে সংযুক্ত · লাইভ অর্ডার চালু";
  ordersRef=db.ref("orders");ordersRef.on("value",snap=>{onlineOrders=snap.val()||{};render()},err=>{$("syncStatus").textContent="অর্ডার লোড হয়নি: "+err.message});
  costsRef=db.ref("settings/salesManagerProductCosts");costsRef.on("value",snap=>{productCosts=snap.val()||{};render()},err=>{$("syncStatus").textContent="কেনা দাম লোড হয়নি: "+err.message});
 });
}
$("saleDate").value=today();updatePreview();render();
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",setupFirebase);else setupFirebase();
