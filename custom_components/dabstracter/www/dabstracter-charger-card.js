var tt=globalThis,et=tt.ShadowRoot&&(tt.ShadyCSS===void 0||tt.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,ot=Symbol(),wt=new WeakMap,j=class{constructor(e,t,s){if(this._$cssResult$=!0,s!==ot)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o,t=this.t;if(et&&e===void 0){let s=t!==void 0&&t.length===1;s&&(e=wt.get(t)),e===void 0&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),s&&wt.set(t,e))}return e}toString(){return this.cssText}},kt=r=>new j(typeof r=="string"?r:r+"",void 0,ot),lt=(r,...e)=>{let t=r.length===1?r[0]:e.reduce((s,i,n)=>s+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+r[n+1],r[0]);return new j(t,r,ot)},At=(r,e)=>{if(et)r.adoptedStyleSheets=e.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of e){let s=document.createElement("style"),i=tt.litNonce;i!==void 0&&s.setAttribute("nonce",i),s.textContent=t.cssText,r.appendChild(s)}},ct=et?r=>r:r=>r instanceof CSSStyleSheet?(e=>{let t="";for(let s of e.cssRules)t+=s.cssText;return kt(t)})(r):r;var{is:qt,defineProperty:Yt,getOwnPropertyDescriptor:Gt,getOwnPropertyNames:Jt,getOwnPropertySymbols:Xt,getPrototypeOf:Zt}=Object,st=globalThis,St=st.trustedTypes,Qt=St?St.emptyScript:"",te=st.reactiveElementPolyfillSupport,B=(r,e)=>r,dt={toAttribute(r,e){switch(e){case Boolean:r=r?Qt:null;break;case Object:case Array:r=r==null?r:JSON.stringify(r)}return r},fromAttribute(r,e){let t=r;switch(e){case Boolean:t=r!==null;break;case Number:t=r===null?null:Number(r);break;case Object:case Array:try{t=JSON.parse(r)}catch{t=null}}return t}},Ct=(r,e)=>!qt(r,e),Et={attribute:!0,type:String,converter:dt,reflect:!1,useDefault:!1,hasChanged:Ct};Symbol.metadata??=Symbol("metadata"),st.litPropertyMetadata??=new WeakMap;var T=class extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=Et){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){let s=Symbol(),i=this.getPropertyDescriptor(e,s,t);i!==void 0&&Yt(this.prototype,e,i)}}static getPropertyDescriptor(e,t,s){let{get:i,set:n}=Gt(this.prototype,e)??{get(){return this[t]},set(a){this[t]=a}};return{get:i,set(a){let l=i?.call(this);n?.call(this,a),this.requestUpdate(e,l,s)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??Et}static _$Ei(){if(this.hasOwnProperty(B("elementProperties")))return;let e=Zt(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(B("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(B("properties"))){let t=this.properties,s=[...Jt(t),...Xt(t)];for(let i of s)this.createProperty(i,t[i])}let e=this[Symbol.metadata];if(e!==null){let t=litPropertyMetadata.get(e);if(t!==void 0)for(let[s,i]of t)this.elementProperties.set(s,i)}this._$Eh=new Map;for(let[t,s]of this.elementProperties){let i=this._$Eu(t,s);i!==void 0&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){let t=[];if(Array.isArray(e)){let s=new Set(e.flat(1/0).reverse());for(let i of s)t.unshift(ct(i))}else e!==void 0&&t.push(ct(e));return t}static _$Eu(e,t){let s=t.attribute;return s===!1?void 0:typeof s=="string"?s:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),this.renderRoot!==void 0&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){let e=new Map,t=this.constructor.elementProperties;for(let s of t.keys())this.hasOwnProperty(s)&&(e.set(s,this[s]),delete this[s]);e.size>0&&(this._$Ep=e)}createRenderRoot(){let e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return At(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,s){this._$AK(e,s)}_$ET(e,t){let s=this.constructor.elementProperties.get(e),i=this.constructor._$Eu(e,s);if(i!==void 0&&s.reflect===!0){let n=(s.converter?.toAttribute!==void 0?s.converter:dt).toAttribute(t,s.type);this._$Em=e,n==null?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(e,t){let s=this.constructor,i=s._$Eh.get(e);if(i!==void 0&&this._$Em!==i){let n=s.getPropertyOptions(i),a=typeof n.converter=="function"?{fromAttribute:n.converter}:n.converter?.fromAttribute!==void 0?n.converter:dt;this._$Em=i;let l=a.fromAttribute(t,n.type);this[i]=l??this._$Ej?.get(i)??l,this._$Em=null}}requestUpdate(e,t,s,i=!1,n){if(e!==void 0){let a=this.constructor;if(i===!1&&(n=this[e]),s??=a.getPropertyOptions(e),!((s.hasChanged??Ct)(n,t)||s.useDefault&&s.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(a._$Eu(e,s))))return;this.C(e,t,s)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(e,t,{useDefault:s,reflect:i,wrapped:n},a){s&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,a??t??this[e]),n!==!0||a!==void 0)||(this._$AL.has(e)||(this.hasUpdated||s||(t=void 0),this._$AL.set(e,t)),i===!0&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[i,n]of this._$Ep)this[i]=n;this._$Ep=void 0}let s=this.constructor.elementProperties;if(s.size>0)for(let[i,n]of s){let{wrapped:a}=n,l=this[i];a!==!0||this._$AL.has(i)||l===void 0||this.C(i,void 0,n,l)}}let e=!1,t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(s=>s.hostUpdate?.()),this.update(t)):this._$EM()}catch(s){throw e=!1,this._$EM(),s}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(e){}firstUpdated(e){}};T.elementStyles=[],T.shadowRootOptions={mode:"open"},T[B("elementProperties")]=new Map,T[B("finalized")]=new Map,te?.({ReactiveElement:T}),(st.reactiveElementVersions??=[]).push("2.1.2");var ft=globalThis,Tt=r=>r,it=ft.trustedTypes,zt=it?it.createPolicy("lit-html",{createHTML:r=>r}):void 0,Nt="$lit$",R=`lit$${Math.random().toFixed(9).slice(2)}$`,Lt="?"+R,ee=`<${Lt}>`,O=document,K=()=>O.createComment(""),V=r=>r===null||typeof r!="object"&&typeof r!="function",_t=Array.isArray,se=r=>_t(r)||typeof r?.[Symbol.iterator]=="function",ht=`[ 	
\f\r]`,F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Rt=/-->/g,Pt=/>/g,M=RegExp(`>|${ht}(?:([^\\s"'>=/]+)(${ht}*=${ht}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Mt=/'/g,Ht=/"/g,It=/^(?:script|style|textarea|title)$/i,vt=r=>(e,...t)=>({_$litType$:r,strings:e,values:t}),d=vt(1),U=vt(2),ve=vt(3),N=Symbol.for("lit-noChange"),c=Symbol.for("lit-nothing"),Ot=new WeakMap,H=O.createTreeWalker(O,129);function Ut(r,e){if(!_t(r)||!r.hasOwnProperty("raw"))throw Error("invalid template strings array");return zt!==void 0?zt.createHTML(e):e}var ie=(r,e)=>{let t=r.length-1,s=[],i,n=e===2?"<svg>":e===3?"<math>":"",a=F;for(let l=0;l<t;l++){let o=r[l],h,p,u=-1,b=0;for(;b<o.length&&(a.lastIndex=b,p=a.exec(o),p!==null);)b=a.lastIndex,a===F?p[1]==="!--"?a=Rt:p[1]!==void 0?a=Pt:p[2]!==void 0?(It.test(p[2])&&(i=RegExp("</"+p[2],"g")),a=M):p[3]!==void 0&&(a=M):a===M?p[0]===">"?(a=i??F,u=-1):p[1]===void 0?u=-2:(u=a.lastIndex-p[2].length,h=p[1],a=p[3]===void 0?M:p[3]==='"'?Ht:Mt):a===Ht||a===Mt?a=M:a===Rt||a===Pt?a=F:(a=M,i=void 0);let g=a===M&&r[l+1].startsWith("/>")?" ":"";n+=a===F?o+ee:u>=0?(s.push(h),o.slice(0,u)+Nt+o.slice(u)+R+g):o+R+(u===-2?l:g)}return[Ut(r,n+(r[t]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),s]},W=class r{constructor({strings:e,_$litType$:t},s){let i;this.parts=[];let n=0,a=0,l=e.length-1,o=this.parts,[h,p]=ie(e,t);if(this.el=r.createElement(h,s),H.currentNode=this.el.content,t===2||t===3){let u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=H.nextNode())!==null&&o.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(let u of i.getAttributeNames())if(u.endsWith(Nt)){let b=p[a++],g=i.getAttribute(u).split(R),_=/([.?@])?(.*)/.exec(b);o.push({type:1,index:n,name:_[2],strings:g,ctor:_[1]==="."?ut:_[1]==="?"?mt:_[1]==="@"?gt:I}),i.removeAttribute(u)}else u.startsWith(R)&&(o.push({type:6,index:n}),i.removeAttribute(u));if(It.test(i.tagName)){let u=i.textContent.split(R),b=u.length-1;if(b>0){i.textContent=it?it.emptyScript:"";for(let g=0;g<b;g++)i.append(u[g],K()),H.nextNode(),o.push({type:2,index:++n});i.append(u[b],K())}}}else if(i.nodeType===8)if(i.data===Lt)o.push({type:2,index:n});else{let u=-1;for(;(u=i.data.indexOf(R,u+1))!==-1;)o.push({type:7,index:n}),u+=R.length-1}n++}}static createElement(e,t){let s=O.createElement("template");return s.innerHTML=e,s}};function L(r,e,t=r,s){if(e===N)return e;let i=s!==void 0?t._$Co?.[s]:t._$Cl,n=V(e)?void 0:e._$litDirective$;return i?.constructor!==n&&(i?._$AO?.(!1),n===void 0?i=void 0:(i=new n(r),i._$AT(r,t,s)),s!==void 0?(t._$Co??=[])[s]=i:t._$Cl=i),i!==void 0&&(e=L(r,i._$AS(r,e.values),i,s)),e}var pt=class{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){let{el:{content:t},parts:s}=this._$AD,i=(e?.creationScope??O).importNode(t,!0);H.currentNode=i;let n=H.nextNode(),a=0,l=0,o=s[0];for(;o!==void 0;){if(a===o.index){let h;o.type===2?h=new q(n,n.nextSibling,this,e):o.type===1?h=new o.ctor(n,o.name,o.strings,this,e):o.type===6&&(h=new bt(n,this,e)),this._$AV.push(h),o=s[++l]}a!==o?.index&&(n=H.nextNode(),a++)}return H.currentNode=O,i}p(e){let t=0;for(let s of this._$AV)s!==void 0&&(s.strings!==void 0?(s._$AI(e,s,t),t+=s.strings.length-2):s._$AI(e[t])),t++}},q=class r{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,s,i){this.type=2,this._$AH=c,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=s,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode,t=this._$AM;return t!==void 0&&e?.nodeType===11&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=L(this,e,t),V(e)?e===c||e==null||e===""?(this._$AH!==c&&this._$AR(),this._$AH=c):e!==this._$AH&&e!==N&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):se(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==c&&V(this._$AH)?this._$AA.nextSibling.data=e:this.T(O.createTextNode(e)),this._$AH=e}$(e){let{values:t,_$litType$:s}=e,i=typeof s=="number"?this._$AC(e):(s.el===void 0&&(s.el=W.createElement(Ut(s.h,s.h[0]),this.options)),s);if(this._$AH?._$AD===i)this._$AH.p(t);else{let n=new pt(i,this),a=n.u(this.options);n.p(t),this.T(a),this._$AH=n}}_$AC(e){let t=Ot.get(e.strings);return t===void 0&&Ot.set(e.strings,t=new W(e)),t}k(e){_t(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,s,i=0;for(let n of e)i===t.length?t.push(s=new r(this.O(K()),this.O(K()),this,this.options)):s=t[i],s._$AI(n),i++;i<t.length&&(this._$AR(s&&s._$AB.nextSibling,i),t.length=i)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){let s=Tt(e).nextSibling;Tt(e).remove(),e=s}}setConnected(e){this._$AM===void 0&&(this._$Cv=e,this._$AP?.(e))}},I=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,s,i,n){this.type=1,this._$AH=c,this._$AN=void 0,this.element=e,this.name=t,this._$AM=i,this.options=n,s.length>2||s[0]!==""||s[1]!==""?(this._$AH=Array(s.length-1).fill(new String),this.strings=s):this._$AH=c}_$AI(e,t=this,s,i){let n=this.strings,a=!1;if(n===void 0)e=L(this,e,t,0),a=!V(e)||e!==this._$AH&&e!==N,a&&(this._$AH=e);else{let l=e,o,h;for(e=n[0],o=0;o<n.length-1;o++)h=L(this,l[s+o],t,o),h===N&&(h=this._$AH[o]),a||=!V(h)||h!==this._$AH[o],h===c?e=c:e!==c&&(e+=(h??"")+n[o+1]),this._$AH[o]=h}a&&!i&&this.j(e)}j(e){e===c?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}},ut=class extends I{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===c?void 0:e}},mt=class extends I{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==c)}},gt=class extends I{constructor(e,t,s,i,n){super(e,t,s,i,n),this.type=5}_$AI(e,t=this){if((e=L(this,e,t,0)??c)===N)return;let s=this._$AH,i=e===c&&s!==c||e.capture!==s.capture||e.once!==s.once||e.passive!==s.passive,n=e!==c&&(s===c||i);i&&this.element.removeEventListener(this.name,this,s),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}},bt=class{constructor(e,t,s){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=s}get _$AU(){return this._$AM._$AU}_$AI(e){L(this,e)}};var ne=ft.litHtmlPolyfillSupport;ne?.(W,q),(ft.litHtmlVersions??=[]).push("3.3.3");var Dt=(r,e,t)=>{let s=t?.renderBefore??e,i=s._$litPart$;if(i===void 0){let n=t?.renderBefore??null;s._$litPart$=i=new q(e.insertBefore(K(),n),n,void 0,t??{})}return i._$AI(r),i};var $t=globalThis,z=class extends T{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=Dt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return N}};z._$litElement$=!0,z.finalized=!0,$t.litElementHydrateSupport?.({LitElement:z});var re=$t.litElementPolyfillSupport;re?.({LitElement:z});($t.litElementVersions??=[]).push("4.2.2");var ae="0.3.1",J={status:["sensor","ev_status"],power:["sensor","charging_power"],current:["sensor","charging_current"],session:["sensor","session_energy"],mode:["select","mode"],amps:["number","max_current"],start:["button","start"],stop:["button","stop"],cpwake:["button","cpwake"],band:["sensor","band_used"],band_limit:["sensor","band_limit"],price:["sensor","price"],pv:["sensor","pv_power"],grid:["sensor","grid_power"],house:["sensor","house_power"],battery:["sensor","battery_power"],soc:["sensor","battery_soc"],charging:["binary_sensor","charging"],limit:["binary_sensor","limit_active"],plan:["binary_sensor","plan_active"],today:["sensor","today_energy"],month:["sensor","month_energy"],total:["sensor","total_energy"]},Y=[["man","MAN"],["pv","PV"],["pv_eco","PV ECO"],["fast","FAST"]],oe=[["soc",80],["soc",90],["soc",100],["kwh",10],["kwh",20],["kwh",30]],le=[10,20,30],ce=["06:00","07:00","08:00"],Kt="dabstracter-flow-view",f={pv:"#facc15",grid:"#3b82f6",house:"#2dd4bf",bat:"#22c55e",ev:"#a78bfa",exp:"#38bdf8"},rt={en:{start:"START",stop:"STOP",mode:"Mode",cur_man:"Manual current",cur_cap:"Max current",band:"Discount band",low:"low price",high:"high price",flow:"Energy flow",sources:"In",loads:"Out",pv:"PV",grid:"Grid",battery:"Battery",house:"House",ev:"Car",export:"Export",charge:"Battery",unavailable:"Charger unavailable",missing:"Pick the DABSTRACTER device in the card editor.",cpwake:"Wake car (CP)",limit:"Charging limit",plan:"Target time",more:"More",over:"over the limit",device:"Charger",title:"Title",show_band:"Show discount band",show_flow:"Show energy flow",show_stats:"Show today / month / total",show_limits:"Show limit and target time",flow_view:"Energy flow view",entities:"Entities (optional overrides)",mode_d0:"Manual: fixed current, no solar control.",mode_d1:"Solar surplus only; stops when there is not enough.",mode_d2:"Solar surplus + minimum current from the grid.",mode_d3:"Fastest: the most the fuse allows.",none:"none",clear:"Clear limit",cancel:"Cancel",set:"Set",how_much:"How much",by_when:"Ready by",eta:"ETA",left:"left",today:"Today",month:"This month",total:"Total",bar:"Bar",diagram:"Diagram",updated:"Updated {t} ago",offline:"No connection to the charger \xB7 last data {t} ago",now:"just now",s:"{n} s",m:"{n} min",h:"{h} h {m} min",limit_set:"Limit set",plan_set:"Target time set",details:"Details",less:"Less",plug_in:"Plug in the car",view:"Layout",compact:"Compact",full:"Full",band_short:"Band",limit_short:"Limit",plan_short:"Ready by",nothing_flows:"No power flow",manual:"manual",cap:"max",min_short:"min",self:"self",pv_long:"Solar",house_tot:"House total",grid_in:"From grid",bat_chg:"Charging",bat_dis:"Discharging",ev_own:"{n} % own"},hu:{start:"START",stop:"STOP",mode:"\xDCzemm\xF3d",cur_man:"K\xE9zi \xE1ram",cur_cap:"Max. \xE1ram",band:"Kedvezm\xE9nyes s\xE1v",low:"kedvezm\xE9nyes \xE1r",high:"magas \xE1r",flow:"Energiafolyam",sources:"Be",loads:"Ki",pv:"PV",grid:"H\xE1l\xF3zat",battery:"Akku",house:"H\xE1z",ev:"Aut\xF3",export:"Bet\xE1pl\xE1l\xE1s",charge:"Akku",unavailable:"A t\xF6lt\u0151 nem el\xE9rhet\u0151",missing:"V\xE1laszd ki a DABSTRACTER eszk\xF6zt a k\xE1rtya-szerkeszt\u0151ben.",cpwake:"Aut\xF3 \xE9breszt\xE9se (CP)",limit:"T\xF6lt\xE9si limit",plan:"C\xE9lid\u0151s t\xF6lt\xE9s",more:"Tov\xE1bbiak",over:"a s\xE1v felett",device:"T\xF6lt\u0151",title:"C\xEDm",show_band:"Kedvezm\xE9nyes s\xE1v mutat\xE1sa",show_flow:"Energiafolyam mutat\xE1sa",show_stats:"Mai / havi / \xF6sszes kWh mutat\xE1sa",show_limits:"Limit \xE9s c\xE9lid\u0151 mutat\xE1sa",flow_view:"Energiafolyam n\xE9zet",entities:"Entit\xE1sok (opcion\xE1lis fel\xFCl\xEDr\xE1s)",mode_d0:"K\xE9zi: fix \xE1ram, napelem-szab\xE1lyoz\xE1s n\xE9lk\xFCl.",mode_d1:"Csak napelem-t\xF6bblet; ha kev\xE9s, le\xE1ll.",mode_d2:"Napelem-t\xF6bblet + minimum \xE1ram a h\xE1l\xF3zatr\xF3l.",mode_d3:"Leggyorsabb: amennyit a biztos\xEDt\xE9k enged.",none:"nincs",clear:"Limit t\xF6rl\xE9se",cancel:"Megszak\xEDt\xE1s",set:"Be\xE1ll\xEDt\xE1s",how_much:"Mennyit",by_when:"Mikorra",eta:"v\xE1rhat\xF3",left:"h\xE1tra",today:"Ma",month:"E h\xF3nap",total:"\xD6sszesen",bar:"S\xE1v",diagram:"Diagram",updated:"Friss\xEDtve {t}",offline:"Nincs kapcsolat a t\xF6lt\u0151vel \xB7 utols\xF3 adat {t}",now:"most",s:"{n} mp-e",m:"{n} perce",h:"{h} \xF3 {m} perce",limit_set:"Limit be\xE1ll\xEDtva",plan_set:"C\xE9lid\u0151 be\xE1ll\xEDtva",details:"R\xE9szletek",less:"Kevesebb",plug_in:"Csatlakoztasd az aut\xF3t",view:"Elrendez\xE9s",compact:"Kompakt",full:"Teljes",band_short:"S\xE1v",limit_short:"Limit",plan_short:"K\xE9sz",nothing_flows:"Nincs energia\xE1raml\xE1s",manual:"k\xE9zi",cap:"max",min_short:"perc",self:"\xF6nell\xE1t\xE1s",pv_long:"Napelem",house_tot:"H\xE1z \xF6sszesen",grid_in:"H\xE1l\xF3zatb\xF3l",bat_chg:"Akku t\xF6lt\xE9s",bat_dis:"Akku kis\xFCt\xE9s",ev_own:"{n} % saj\xE1t"}};function xt(r){return(r?.locale?.language||r?.language||"en").startsWith("hu")?"hu":"en"}function de(r,e){let t={},s=Object.values(r.entities||{});for(let i of Object.keys(J)){let n=e.entities?.[i];if(n){t[i]=n;continue}if(!e.device_id)continue;let[a,l]=J[i],o=s.find(h=>h.device_id===e.device_id&&h.platform==="dabstracter"&&h.translation_key===l&&h.entity_id.startsWith(a+"."));o&&(t[i]=o.entity_id)}return t}function jt(r){return Object.values(r.entities||{}).find(t=>t.platform==="dabstracter"&&t.device_id)?.device_id}var x=r=>{if(!r)return null;let e=Number(r.state);return Number.isFinite(e)&&r.state!==""?e:null};function Bt(r){return r>100?"#ef4444":r>=90?"#f97316":r>=75?"#eab308":"#10b981"}function P(r,e){return Math.abs(r)>=1e3?`${(r/1e3).toLocaleString(e,{minimumFractionDigits:1,maximumFractionDigits:1})} kW`:`${Math.round(r)} W`}function Ft(r,e,t=1){return`${r.toLocaleString(e,{maximumFractionDigits:t})} kWh`}function he(){try{let r=localStorage.getItem(Kt);return r==="bar"||r==="diagram"?r:null}catch{return null}}function pe(r){try{localStorage.setItem(Kt,r)}catch{}}var Vt="dabstracter-details-open";function ue(){try{return localStorage.getItem(Vt)==="1"}catch{return!1}}function me(r){try{localStorage.setItem(Vt,r?"1":"0")}catch{}}var G=class extends z{constructor(){super(...arguments);this._pendingA=null;this._busy="";this._more=!1;this._view="bar";this._planKwh=null;this._planTime=null;this._link=null;this._tick=0;this._open=!1;this._aTimer=0;this._clock=0;this._ents={};this._linkAt=0}static getConfigElement(){return document.createElement("dabstracter-charger-card-editor")}static getStubConfig(t){return{device_id:jt(t)}}setConfig(t){if(!t)throw new Error("Invalid configuration");this._config={show_band:!0,show_flow:!0,show_stats:!0,show_limits:!0,...t},this._view=he()??t.flow_view??"bar",this._open=ue()}getCardSize(){return this._config?.view==="full"?9:this._open?8:4}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}connectedCallback(){super.connectedCallback(),this._clock=window.setInterval(()=>{this._tick++,this._fetchLink()},5e3)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._clock)}willUpdate(t){if((t.has("hass")||t.has("_config"))&&this.hass&&this._config){let s=this._config.device_id||this._config.entities?this._config:{...this._config,device_id:jt(this.hass)};this._ents=de(this.hass,s);let i=this._ents.status;this._deviceId=s.device_id||(i?this.hass.entities?.[i]?.device_id:void 0),this._linkAt||this._fetchLink()}}async _fetchLink(){if(!(!this.hass?.connection||!this._deviceId||Date.now()-this._linkAt<9e3)){this._linkAt=Date.now();try{let t=await this.hass.connection.sendMessagePromise({type:"dabstracter/status",device_id:this._deviceId});this._link={ok:!!t.ok,last:t.last_update?Date.parse(t.last_update):null}}catch{this._link=null}}}t(t,s={}){let i=xt(this.hass),n=rt[i][t]??rt.en[t]??t;for(let[a,l]of Object.entries(s))n=n.replace(`{${a}}`,String(l));return n}s(t){let s=this._ents[t];return s?this.hass?.states[s]:void 0}_ago(t){let s=Math.max(0,Math.round((Date.now()-t)/1e3));return s<3?this.t("now"):s<60?this.t("s",{n:s}):s<3600?this.t("m",{n:Math.floor(s/60)}):this.t("h",{h:Math.floor(s/3600),m:Math.floor(s%3600/60)})}_dur(t){let s=Math.floor(t/3600),i=Math.floor(t%3600/60),n=xt(this.hass)==="hu";return s?`${s} ${n?"\xF3":"h"} ${i} ${this.t("min_short")}`:`${i} ${this.t("min_short")}`}async _call(t,s,i,n,a){if(!this.hass)return!1;this._busy=n;try{return await this.hass.callService(t,s,i),a&&this._toast(a),!0}catch(l){return this._toast(l?.message||String(l)),!1}finally{this._busy=""}}_toast(t){this.dispatchEvent(new CustomEvent("hass-notification",{detail:{message:t},bubbles:!0,composed:!0}))}_press(t){let s=this._ents[t];if(s){if(navigator.vibrate)try{navigator.vibrate(20)}catch{}this._call("button","press",{entity_id:s},t)}}_mode(t){let s=this._ents.mode;s&&this._call("select","select_option",{entity_id:s,option:t},"mode:"+t)}_setA(t){let s=this.s("amps");if(!s)return;let i=Number(s.attributes.min??6),n=Number(s.attributes.max??32);this._pendingA=Math.max(i,Math.min(n,Math.round(t))),clearTimeout(this._aTimer),this._aTimer=window.setTimeout(async()=>{let a=this._pendingA;a!=null&&(await this._call("number","set_value",{entity_id:s.entity_id,value:a},"amps"),this._pendingA=null)},900)}_step(t){let s=this.s("amps");s&&this._setA((this._pendingA??x(s)??Number(s.attributes.min??6))+t)}_setLimit(t,s){this._deviceId&&this._call("dabstracter","set_limit",{device_id:this._deviceId,type:t,value:s},`lim:${t}:${s}`,this.t("limit_set"))}_clearLimit(){this._deviceId&&this._call("dabstracter","set_limit",{device_id:this._deviceId,clear:!0},"lim:clear")}async _setPlan(){if(!this._deviceId||this._planKwh==null||!this._planTime)return;await this._call("dabstracter","set_plan",{device_id:this._deviceId,type:"kwh",value:this._planKwh,time:this._planTime},"plan:set",this.t("plan_set"))&&(this._planKwh=null,this._planTime=null)}_cancelPlan(){this._deviceId&&this._call("dabstracter","set_plan",{device_id:this._deviceId,cancel:!0},"plan:cancel")}_setView(t){this._view=t,pe(t)}_unit(t){return t==="soc"?" %":t==="km"?" km":" kWh"}render(){if(!this.hass||!this._config)return c;let t=this.s("status");if(!t)return d`<ha-card><div class="msg">${this.t("missing")}</div></ha-card>`;let s=this.hass.locale?.language||"en",i=t.state==="unavailable",n=t.state,a=n==="charging"||n==="charging_vent"?"chg":["cp_pe_short","rcmu_fault","diode_short","over_dlb","fault"].includes(n)?"flt":n==="stopped"?"stp":["connected","connected_b2","init"].includes(n)?"con":"",l=a==="chg",o=i?this.t("unavailable"):this.hass.formatEntityState?.(t)??n,h=this.s("mode"),p=Y.findIndex(([k])=>k===h?.state),u=x(this.s("power")),[b,g]=u==null?["\u2014",""]:P(u,s).split(" "),_=[],S=x(this.s("current"));l&&S!=null&&_.push(`${S.toLocaleString(s,{maximumFractionDigits:1})} A`);let y=this.s("session"),$=x(y);if($!=null&&$>0){_.push(Ft($,s,2));let k=Number(y?.attributes.duration_s);k>0&&_.push(this._dur(k));let E=y?.attributes.cost;E!=null&&Number.isFinite(Number(E))&&_.push(`${Math.round(Number(E)).toLocaleString(s)} Ft`)}let m=[],v=this.s("limit"),w=this.s("plan");return v?.state==="on"&&m.push(`${this.t("limit")}: ${this._limitText(v.attributes,s)}`),w?.state==="on"&&m.push(`${this.t("plan")}: ${this._planText(w.attributes)}`),this._config.view!=="full"?this._compact({loc:s,unavailable:i,cls:a,charging:l,stText:o,modeSt:h,modeIdx:p,pw:u,pv:b,pu:g,sub:_,st:n}):d`<ha-card>
      ${this._config.title?d`<div class="title">${this._config.title}</div>`:c}
      <div class="hero">
        <div class="hst"><span class="hdot ${i?"flt":a}"></span><span>${o}</span>
          ${p>=0?d`<span class="hmode">${Y[p][1]}</span>`:c}</div>
        <div class="hpow">${b}<small>${g}</small></div>
        <div class="hsub">${_.join(" \xB7 ")}</div>
        ${m.length?d`<div class="hsub">${m.join(" \xB7 ")}</div>`:c}
        <div class="bigrow">
          <button class="bigbtn go ${l?"dim":""} ${this._busy==="start"?"busy":""}" ?disabled=${i||!this._ents.start||!!this._busy}
            @click=${()=>this._press("start")}>${this.t("start")}</button>
          <button class="bigbtn stop ${l?"":"dim"} ${this._busy==="stop"?"busy":""}" ?disabled=${i||!this._ents.stop||!!this._busy}
            @click=${()=>this._press("stop")}>${this.t("stop")}</button>
        </div>
        ${this._ents.cpwake?d`<div class="hfoot"><button class="lnk" @click=${()=>this._more=!this._more}>${this.t("more")} ${this._more?"\u25B4":"\u25BE"}</button></div>
          ${this._more?d`<button class="btn wide" ?disabled=${i||!!this._busy} @click=${()=>this._press("cpwake")}>${this.t("cpwake")}</button>`:c}`:c}
      </div>

      ${h?d`<div class="sec">
        <div class="h2">${this.t("mode")}</div>
        <div class="segm">${Y.map(([k,E])=>d`<button class="${h.state===k?"on":""} ${this._busy==="mode:"+k?"busy":""}"
          ?disabled=${i||!!this._busy} @click=${()=>this._mode(k)}>${E}</button>`)}</div>
        ${p>=0?d`<p class="desc">${this.t("mode_d"+p)}</p>`:c}
      </div>`:c}

      ${this._amps(i,p===0)}
      ${this._config.show_limits!==!1?this._limits(i,s):c}
      ${this._config.show_band!==!1?this._band(s):c}
      ${this._config.show_stats!==!1?this._stats(s):c}
      ${this._config.show_flow!==!1?this._flow(s,u):c}
      ${this._footer()}
    </ha-card>`}_limitText(t,s){let i=`${t.value}${this._unit(t.type)}`;return t.remainWh!=null&&(i+=` \xB7 ${Ft(t.remainWh/1e3,s)} ${this.t("left")}`),i}_planText(t){let s=`${t.value}${this._unit(t.type)}`;return t.deadlineHm&&(s+=` \xB7 ${t.deadlineHm}`),t.etaHm&&(s+=` \xB7 ${this.t("eta")} ${t.etaHm}`),s}_amps(t,s){let i=this.s("amps");if(!i)return c;let n=Number(i.attributes.min??6),a=Number(i.attributes.max??32),l=this._pendingA??x(i);return d`<div class="sec">
      <div class="h2">${this.t(s?"cur_man":"cur_cap")}</div>
      <div class="amp">
        <button class="step" ?disabled=${t} @click=${()=>this._step(-1)} aria-label="−1 A">−</button>
        <div class="aval ${this._pendingA!=null?"dirty":""}">${l??"\u2014"}<small>A</small></div>
        <button class="step" ?disabled=${t} @click=${()=>this._step(1)} aria-label="+1 A">+</button>
      </div>
      <input class="range" type="range" min=${n} max=${a} step="1" .value=${String(l??n)} ?disabled=${t}
        aria-label=${this.t(s?"cur_man":"cur_cap")} @input=${o=>this._setA(Number(o.target.value))} />
      <div class="arange"><span>${n} A</span><span>${a} A</span></div>
    </div>`}_limits(t,s){let i=this.s("limit"),n=this.s("plan");if(!i&&!n)return c;let a=t||!!this._busy||!this._deviceId,l=i?.state==="on",o=n?.state==="on";return d`
      ${i?d`<details class="sec fold">
        <summary><span>${this.t("limit")}</span><span class="fs ${l?"act":""}">${l?this._limitText(i.attributes,s):this.t("none")}</span></summary>
        <div class="chips">${oe.map(([h,p])=>{let u=l&&i.attributes.type===h&&Number(i.attributes.value)===p;return d`<button class="chip ${u?"on":""} ${this._busy===`lim:${h}:${p}`?"busy":""}" ?disabled=${a}
            @click=${()=>this._setLimit(h,p)}>${p}${this._unit(h)}</button>`})}</div>
        ${l?d`<button class="btn wide ${this._busy==="lim:clear"?"busy":""}" ?disabled=${a} @click=${this._clearLimit}>${this.t("clear")}</button>`:c}
      </details>`:c}
      ${n?d`<details class="sec fold">
        <summary><span>${this.t("plan")}</span><span class="fs ${o?"act":""}">${o?this._planText(n.attributes):this.t("none")}</span></summary>
        <div class="lbl">${this.t("how_much")}</div>
        <div class="chips">${le.map(h=>d`<button class="chip ${this._planKwh===h?"on":""}" ?disabled=${a}
          @click=${()=>this._planKwh=h}>${h} kWh</button>`)}</div>
        <div class="lbl">${this.t("by_when")}</div>
        <div class="chips">${ce.map(h=>d`<button class="chip ${this._planTime===h?"on":""}" ?disabled=${a}
          @click=${()=>this._planTime=h}>${h}</button>`)}</div>
        <div class="row2">
          <button class="btn prim ${this._busy==="plan:set"?"busy":""}" ?disabled=${a||this._planKwh==null||!this._planTime}
            @click=${this._setPlan}>${this.t("set")}</button>
          ${o?d`<button class="btn ${this._busy==="plan:cancel"?"busy":""}" ?disabled=${a} @click=${this._cancelPlan}>${this.t("cancel")}</button>`:c}
        </div>
      </details>`:c}`}_band(t){let s=this.s("band"),i=x(this.s("band_limit")),n=x(s);if(n==null||!i)return c;let a=n/i*100,l=s?.attributes.tier,o=this.s("price"),h=o&&x(o)!=null?`${x(o).toLocaleString(t,{maximumFractionDigits:2})} ${o.attributes.unit_of_measurement||""}`:"";return d`<div class="sec band">
      <div class="bh"><span><b>${this.t("band")}</b></span>
        ${l?d`<span class="bp ${l==="high"?"high":"low"}">${this.t(l==="high"?"high":"low")}${h?" \xB7 "+h:""}</span>`:c}</div>
      <div class="bm"><i style="width:${Math.min(100,a).toFixed(1)}%;background:${Bt(a)}"></i></div>
      <div class="bs">${n.toLocaleString(t,{maximumFractionDigits:0})} / ${i.toLocaleString(t,{maximumFractionDigits:0})} kWh · ${a.toLocaleString(t,{maximumFractionDigits:0})} %${a>100?" \xB7 "+this.t("over"):""}</div>
    </div>`}_stats(t){let s=["today","month","total"].map(i=>[i,x(this.s(i))]).filter(([,i])=>i!=null);return s.length?d`<div class="sec stats">${s.map(([i,n])=>d`<div class="st">
      <span>${this.t(i)}</span><b>${n.toLocaleString(t,{maximumFractionDigits:i==="total"?0:1})}<small> kWh</small></b></div>`)}</div>`:c}_flow(t,s){let i=x(this.s("pv")),n=x(this.s("grid")),a=x(this.s("house")),l=x(this.s("battery"));if(i==null&&n==null)return c;let o=x(this.s("soc")),h=o!=null?` ${Math.round(o)}%`:"",p=[],u=[];i&&i>0&&p.push({w:i,c:f.pv,label:this.t("pv")}),n&&n>0&&p.push({w:n,c:f.grid,label:this.t("grid")}),l&&l>0&&p.push({w:l,c:f.bat,label:this.t("battery")+h}),s&&s>0&&u.push({w:s,c:f.ev,label:this.t("ev")}),a&&a>0&&u.push({w:a,c:f.house,label:this.t("house")}),l&&l<0&&u.push({w:-l,c:f.bat,label:this.t("charge")+h}),n&&n<0&&u.push({w:-n,c:f.grid,label:this.t("export")});let b=p.reduce((m,v)=>m+v.w,0),g=u.reduce((m,v)=>m+v.w,0),_=Math.max(b,g,1),S=(m,v)=>d`<div class="flbr ${v}">${m.map(w=>{let k=`width:${w.w/_*100}%;color:${w.c}`;if(w.w/_<.28)return d`<div class="bk" style=${k}></div>`;let E=d`<span>${w.label} ${P(w.w,t)}</span>`;return d`<div class="bk" style=${k}>${v==="top"?d`${E}<i></i>`:d`<i></i>${E}`}</div>`})}</div>`,y=m=>d`<div class="flbar">${m.map(v=>{let w=v.w/_;return d`<i style="width:${w*100}%;background:${v.c}">${w>=.12&&w<.28?d`<span>${P(v.w,t)}</span>`:c}</i>`})}</div>`,$=(m,v,w)=>d`<div class="lg"><div class="lgh"><b>${m}</b><b>${P(w,t)}</b></div>
      ${v.map(k=>d`<div class="lgi"><span><i style="background:${k.c}"></i>${k.label}</span><b>${P(k.w,t)}</b></div>`)}</div>`;return d`<div class="sec">
      <div class="flh"><div class="h2">${this.t("flow")}</div>
        <div class="flseg">${["bar","diagram"].map(m=>d`<button class="${this._view===m?"on":""}" @click=${()=>this._setView(m)}>${this.t(m)}</button>`)}</div></div>
      ${this._view==="diagram"?this._diagram(t,{pv:i,grid:n,house:a,bat:l,ev:s,soc:o}):d`${S(p,"top")}${y(p)}<div class="gap"></div>${y(u)}${S(u,"bot")}`}
      <div class="lgs">${$(this.t("sources"),p,b)}${$(this.t("loads"),u,g)}</div>
    </div>`}_diagram(t,s){let i=A=>A==null?0:Math.max(0,A),n=A=>A==null?0:Math.max(0,-A),a=i(s.pv),l=i(s.grid),o=n(s.grid),h=i(s.bat),p=n(s.bat),u=i(s.house),b=i(s.ev),g=u+b,_=g>20?Math.max(0,Math.min(100,Math.round(100*(1-l/g)))):null,S=b>=50?Math.round(100*(b-Math.min(b,l))/b):null,y=A=>P(A,t),$=(A,C,X,Z,Q,D,at=!1)=>U`
      <g class="fn ${D>=10?"act":""}" style="--c:${X}">
        <rect class="fg" x=${A-46} y=${C-19} width="92" height="38" rx="12"/>
        <rect class="fb" x=${A-44} y=${C-17} width="88" height="34" rx="11"/>
        <text x=${A} y=${C+5} text-anchor="middle" class="fv">${Q}</text>
        <text x=${A} y=${at?C+34:C-26} text-anchor="middle" class="ft">${Z}</text></g>`,m=(A,C,X,Z,Q,D,at=!1)=>{let yt=D>=10,Wt=yt?`stroke-width:${(3.5+Math.min(4,D/2e3)).toFixed(1)};animation-duration:${Math.max(.4,1.6-D/6e3).toFixed(2)}s`:"";return U`<line class="flb" x1=${A} y1=${C} x2=${X} y2=${Z} stroke=${Q}/>
        ${yt?U`<line class="fl ${at?"rev":""}" style=${Wt} x1=${A} y1=${C} x2=${X} y2=${Z} stroke=${Q}/>`:c}`},v=(A,C)=>A==null?"\u2013":C,w=s.soc==null?null:Math.max(0,Math.min(100,s.soc)),k=s.grid==null?"":o>=10?this.t("export"):l>=10?this.t("grid_in"):"",E=s.bat==null?"":p>=10?this.t("bat_chg"):h>=10?this.t("bat_dis"):"";return d`<svg class="flsvg" viewBox="0 0 360 318" role="img" aria-label=${this.t("flow")}>
      ${m(180,68,180,124,f.pv,a)}
      ${m(108,150,154,150,o>l?f.exp:f.grid,l+o,o>l)}
      ${m(206,150,252,150,f.house,g)}
      ${m(180,176,180,233,f.bat,p+h,h>p)}
      ${m(298,169,298,233,f.ev,b)}
      <rect x="154" y="124" width="52" height="52" rx="14" class="fhub"/>
      <text x="180" y="149" text-anchor="middle" class="fhi">⇄</text>
      ${_!=null?U`<text x="180" y="166" text-anchor="middle" class="fhs">${_} %</text>`:c}
      ${$(180,49,f.pv,`\u2600\uFE0F ${this.t("pv_long")}`,v(s.pv,y(a)),a)}
      ${$(62,150,o>l?f.exp:f.grid,`\u26A1 ${this.t("grid")}`,v(s.grid,y(Math.max(l,o))),l+o)}
      <text x="62" y="186" text-anchor="middle" class="fs2">${k}</text>
      ${$(298,150,f.house,`\u{1F3E0} ${this.t("house_tot")}`,v(s.house,y(g)),g)}
      ${$(180,252,f.bat,`\u{1F50B} ${this.t("battery")}`,v(s.bat,y(Math.max(p,h))),p+h,!0)}
      <text x="128" y="257" text-anchor="end" class="fs2">${E}</text>
      ${w!=null?U`
        <rect x="148" y="296" width="60" height="16" rx="4" fill="none" stroke=${f.bat} stroke-width="1.6"/>
        <rect x="208" y="301" width="3" height="6" rx="1" fill=${f.bat}/>
        <rect x="150" y="298" width=${(56*w/100).toFixed(1)} height="12" rx="2.5" fill=${f.bat} opacity=".45"/>
        <text x="178" y="308" text-anchor="middle" class="fsoc">${Math.round(w)} %</text>`:c}
      ${$(298,252,f.ev,`\u{1F697} ${this.t("ev")}${S!=null?" \xB7 "+this.t("ev_own",{n:S}):""}`,y(b),b,!0)}
    </svg>`}_compact(t){let{loc:s,unavailable:i,cls:n,charging:a,stText:l,modeSt:o,modeIdx:h,pv:p,pu:u}=t,b=t.sub.length?t.sub:t.st==="ready"&&!i?[this.t("plug_in")]:[],g=a?"stop":"start",_=this.s("amps"),S=this._pendingA??x(_),y=this._link&&!this._link.ok;return d`<ha-card class="cmp ${n}">
      ${this._config.title?d`<div class="title">${this._config.title}</div>`:c}
      <div class="ch">
        <div class="cs">
          <span class="hdot ${i?"flt":n}"></span><span class="cst">${l}</span>
          ${h>=0?d`<span class="hmode">${Y[h][1]}</span>`:c}
        </div>
        <div class="cpw ${b.length?"two":""}">${p}<small>${u}</small></div>
        ${b.length?d`<div class="csub">${b.map($=>d`<span>${$}</span>`)}</div>`:c}
      </div>
      ${this._rail(s,t.pw,a)}
      <div class="cact">
        <button class="cbtn ${g} ${this._busy===g?"busy":""}" ?disabled=${i||!this._ents[g]||!!this._busy}
          @click=${()=>this._press(g)}>${this.t(g)}</button>
        ${_?d`<div class="camp ${this._pendingA!=null?"dirty":""}">
          <button ?disabled=${i} @click=${()=>this._step(-1)} aria-label="−1 A">−</button>
          <div class="cav"><b>${S??"\u2014"}<small>A</small></b><span>${this.t(h===0?"manual":"cap")}</span></div>
          <button ?disabled=${i} @click=${()=>this._step(1)} aria-label="+1 A">+</button>
        </div>`:c}
      </div>
      ${o?d`<div class="segm cseg">${Y.map(([$,m])=>d`<button class="${o.state===$?"on":""} ${this._busy==="mode:"+$?"busy":""}"
        ?disabled=${i||!!this._busy} @click=${()=>this._mode($)}>${m}</button>`)}</div>`:c}
      <button class="cmore" aria-expanded=${this._open?"true":"false"} @click=${()=>{this._open=!this._open,me(this._open)}}>
        ${this.t(this._open?"less":"details")}<span class="chev ${this._open?"up":""}"></span></button>
      ${this._open?d`<div class="cdet">
        ${_?this._slider(i,h===0):c}
        ${this._config.show_limits!==!1?this._limits(i,s):c}
        ${this._config.show_band!==!1?this._band(s):c}
        ${this._config.show_stats!==!1?this._stats(s):c}
        ${this._config.show_flow!==!1?this._flow(s,t.pw):c}
        ${this._ents.cpwake?d`<div class="sec"><button class="btn wide" ?disabled=${i||!!this._busy}
          @click=${()=>this._press("cpwake")}>${this.t("cpwake")}</button></div>`:c}
        ${this._footer()}
      </div>`:y?this._footer():c}
    </ha-card>`}_rail(t,s,i){let n=x(this.s("pv")),a=x(this.s("grid")),l=x(this.s("battery")),o=[];n&&n>0&&o.push({w:n,c:f.pv,label:this.t("pv")}),a&&a>0&&o.push({w:a,c:f.grid,label:this.t("grid")}),l&&l>0&&o.push({w:l,c:f.bat,label:this.t("battery")});let h=n!=null||a!=null,p=o.reduce((m,v)=>m+v.w,0),u=[...o].sort((m,v)=>v.w-m.w)[0],b=a!=null&&a<-20?-a:0,g=[],_=x(this.s("band")),S=x(this.s("band_limit"));if(this._config.show_band!==!1&&_!=null&&S){let m=_/S*100;g.push(d`<span class="pill" style="--pc:${Bt(m)}">${this.t("band_short")} ${Math.round(m)} %</span>`)}let y=this.s("limit"),$=this.s("plan");return y?.state==="on"&&g.push(d`<span class="pill" style="--pc:${f.ev}">${this.t("limit_short")} ${y.attributes.value}${this._unit(y.attributes.type)}</span>`),$?.state==="on"&&$.attributes.deadlineHm&&g.push(d`<span class="pill" style="--pc:${f.ev}">${this.t("plan_short")} ${$.attributes.deadlineHm}</span>`),!h&&!g.length?c:d`<div class="rail">
      ${h?d`<div class="rbar ${i&&(s??0)>0?"live":""}">${o.map(m=>d`<i style="flex:${m.w/Math.max(p,1)};background:${m.c}"></i>`)}</div>`:c}
      <div class="rtx">
        <span class="rsrc">${h?u?d`${o.map(m=>d`<span><i style="background:${m.c}"></i>${m.label} ${P(m.w,t)}</span>`)}`:this.t("nothing_flows"):""}${b?d`<span><i style="background:${f.exp}"></i>${this.t("export")} ${P(b,t)}</span>`:c}</span>
        ${g.length?d`<span class="pills">${g}</span>`:c}
      </div>
    </div>`}_slider(t,s){let i=this.s("amps");if(!i)return c;let n=Number(i.attributes.min??6),a=Number(i.attributes.max??32),l=this._pendingA??x(i);return d`<div class="sec">
      <div class="h2">${this.t(s?"cur_man":"cur_cap")}</div>
      <input class="range" type="range" min=${n} max=${a} step="1" .value=${String(l??n)} ?disabled=${t}
        aria-label=${this.t(s?"cur_man":"cur_cap")} @input=${o=>this._setA(Number(o.target.value))} />
      <div class="arange"><span>${n} A</span><span>${a} A</span></div>
    </div>`}_footer(){if(this._tick,!this._link||this._link.last==null)return c;let t=this._ago(this._link.last);return this._link.ok?d`<div class="foot">${this.t("updated",{t})}</div>`:d`<div class="foot err">${this.t("offline",{t})}</div>`}};G.properties={hass:{attribute:!1},_config:{state:!0},_pendingA:{state:!0},_busy:{state:!0},_more:{state:!0},_view:{state:!0},_planKwh:{state:!0},_planTime:{state:!0},_link:{state:!0},_tick:{state:!0},_open:{state:!0}},G.styles=lt`
    :host { --dab-green: #10b981; --dab-red: #f87171; --dab-amber: #f59e0b; --dab-accent: var(--primary-color, #38bdf8); }
    ha-card { padding: 16px; }
    .title { font-size: 1.1rem; font-weight: 700; margin-bottom: 8px; }
    .msg { padding: 8px; color: var(--secondary-text-color); }
    .hero { text-align: center; }
    .hst { display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 1.05rem; font-weight: 700; flex-wrap: wrap; }
    .hdot { width: 12px; height: 12px; border-radius: 50%; background: var(--secondary-text-color); flex: none; }
    .hdot.chg { background: var(--dab-green); animation: hpulse 1.6s infinite; }
    .hdot.con { background: var(--dab-accent); }
    .hdot.stp { background: var(--dab-amber); }
    .hdot.flt { background: var(--error-color, #ef4444); }
    @keyframes hpulse { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.6); } 70% { box-shadow: 0 0 0 10px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
    .hmode { font-size: .75rem; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid var(--divider-color); color: var(--secondary-text-color); }
    .hpow { font-size: 2.5rem; font-weight: 800; line-height: 1.1; margin-top: 6px; font-variant-numeric: tabular-nums; }
    .hpow small { font-size: 1.1rem; font-weight: 700; color: var(--secondary-text-color); margin-left: 4px; }
    .hsub { color: var(--secondary-text-color); font-size: .875rem; margin-top: 2px; min-height: 1.2em; font-variant-numeric: tabular-nums; }
    .bigrow { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
    .bigbtn { position: relative; min-height: 60px; border-radius: 14px; border: 0; font: inherit; font-size: 1.25rem; font-weight: 800; letter-spacing: .06em; cursor: pointer; background: var(--dab-green); color: #04150f; touch-action: manipulation; }
    .bigbtn.stop { background: var(--dab-red); color: #1a0505; }
    .bigbtn.dim { background: transparent; color: var(--primary-text-color); }
    .bigbtn.go.dim { box-shadow: inset 0 0 0 2px rgba(16,185,129,.55); }
    .bigbtn.stop.dim { box-shadow: inset 0 0 0 2px rgba(248,113,113,.55); }
    button:disabled, input:disabled { opacity: .45; cursor: not-allowed; }
    .busy { color: transparent !important; position: relative; }
    .busy::after { content: ""; position: absolute; left: 50%; top: 50%; width: 18px; height: 18px; margin: -9px 0 0 -9px; border-radius: 50%; border: 3px solid rgba(128,128,128,.35); border-top-color: var(--primary-text-color); animation: spin .8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .hfoot { display: flex; justify-content: flex-end; margin-top: 6px; }
    .lnk { background: none; border: 0; color: var(--dab-accent); font: inherit; font-size: .875rem; padding: 6px 0; cursor: pointer; }
    .btn { position: relative; min-height: 44px; padding: 0 16px; border-radius: 12px; border: 1px solid var(--divider-color); background: none; color: var(--primary-text-color); font: inherit; font-weight: 600; cursor: pointer; }
    .btn.wide { width: 100%; }
    .btn.prim { background: var(--dab-accent); border-color: transparent; color: var(--text-primary-color, #05131f); }
    .sec { margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
    .h2 { font-weight: 700; margin-bottom: 8px; }
    .segm { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 4px; padding: 4px; border-radius: 12px; border: 1px solid var(--divider-color); }
    .segm button { position: relative; min-height: 46px; border: 0; border-radius: 9px; background: none; color: var(--primary-text-color); font: inherit; font-weight: 700; font-size: .9rem; cursor: pointer; }
    .segm button.on { background: var(--dab-accent); color: var(--text-primary-color, #05131f); }
    .desc { color: var(--secondary-text-color); font-size: .85rem; margin: 6px 0 0; }
    .amp { display: grid; grid-template-columns: 64px 1fr 64px; align-items: center; gap: 10px; }
    .step { height: 56px; border-radius: 14px; border: 1px solid var(--divider-color); background: rgba(128,128,128,.08); color: var(--primary-text-color); font-size: 1.8rem; font-weight: 600; cursor: pointer; touch-action: manipulation; }
    .aval { text-align: center; font-size: 2.2rem; font-weight: 800; font-variant-numeric: tabular-nums; }
    .aval small { font-size: 1rem; color: var(--secondary-text-color); margin-left: 4px; }
    .aval.dirty { color: var(--dab-accent); }
    .range { width: 100%; margin: 12px 0 0; height: 32px; accent-color: var(--dab-accent); }
    .arange { display: flex; justify-content: space-between; color: var(--secondary-text-color); font-size: .8rem; }
    details.fold > summary { list-style: none; cursor: pointer; display: flex; justify-content: space-between; align-items: center; gap: 12px; font-weight: 700; min-height: 32px; }
    details.fold > summary::-webkit-details-marker { display: none; }
    details.fold > summary::after { content: "▾"; color: var(--secondary-text-color); transition: transform .15s; }
    details.fold[open] > summary::after { transform: rotate(180deg); }
    details.fold[open] > summary { margin-bottom: 8px; }
    .fs { margin-left: auto; font-weight: 500; font-size: .85rem; color: var(--secondary-text-color); text-align: right; }
    .fs.act { color: var(--dab-green); }
    .lbl { font-size: .8rem; color: var(--secondary-text-color); margin-top: 4px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin: 6px 0 10px; }
    .chip { position: relative; min-height: 40px; padding: 0 14px; border-radius: 999px; border: 1px solid var(--divider-color); background: rgba(128,128,128,.06); color: var(--primary-text-color); font: inherit; font-size: .875rem; font-weight: 600; cursor: pointer; }
    .chip.on { background: var(--dab-accent); border-color: transparent; color: var(--text-primary-color, #05131f); }
    .row2 { display: flex; gap: 8px; }
    .row2 .btn { flex: 1; }
    .band .bh { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; font-size: .875rem; }
    .band .bp { font-size: .78rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; white-space: nowrap; }
    .band .bp.low { background: rgba(16,185,129,.15); color: var(--dab-green); border: 1px solid rgba(16,185,129,.4); }
    .band .bp.high { background: rgba(245,158,11,.15); color: var(--dab-amber); border: 1px solid rgba(245,158,11,.45); }
    .band .bm { height: 12px; border-radius: 999px; background: rgba(128,128,128,.15); overflow: hidden; margin-top: 8px; }
    .band .bm i { display: block; height: 100%; border-radius: 999px; transition: width .4s, background .4s; }
    .band .bs { font-size: .85rem; color: var(--secondary-text-color); margin-top: 6px; font-variant-numeric: tabular-nums; }
    .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
    .st { display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; border-radius: 12px; background: rgba(128,128,128,.08); min-width: 0; }
    .st span { font-size: .78rem; color: var(--secondary-text-color); }
    .st b { font-size: 1.1rem; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .st small { font-size: .75rem; font-weight: 600; color: var(--secondary-text-color); }
    .flh { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px; }
    .flh .h2 { margin: 0; }
    .flseg { display: inline-flex; gap: 3px; padding: 3px; border-radius: 10px; border: 1px solid var(--divider-color); }
    .flseg button { border: 0; background: none; color: var(--primary-text-color); font: inherit; font-size: .8rem; font-weight: 700; padding: 5px 12px; border-radius: 7px; cursor: pointer; min-height: 32px; }
    .flseg button.on { background: var(--dab-accent); color: var(--text-primary-color, #05131f); }
    .flbar { display: flex; height: 22px; border-radius: 8px; overflow: hidden; background: rgba(128,128,128,.12); }
    .flbar i { display: flex; align-items: center; justify-content: center; height: 100%; min-width: 4px; overflow: hidden; font-style: normal; transition: width .5s; }
    .flbar i + i { border-left: 2px solid var(--card-background-color, var(--ha-card-background, #1c1c1c)); }
    .flbar i span { font-size: .72rem; font-weight: 800; color: #05131f; white-space: nowrap; padding: 0 3px; font-variant-numeric: tabular-nums; }
    .gap { height: 4px; }
    .flbr { display: flex; min-height: 24px; }
    .flbr.top { align-items: flex-end; }
    .flbr .bk { display: flex; flex-direction: column; min-width: 4px; transition: width .5s; }
    .flbr .bk i { display: block; height: 6px; border: 2px solid; margin: 0 2px; }
    .flbr.top .bk i { border-bottom: 0; border-radius: 6px 6px 0 0; }
    .flbr.bot .bk i { border-top: 0; border-radius: 0 0 6px 6px; }
    .flbr .bk span { font-size: .78rem; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: center; padding: 2px 0; font-variant-numeric: tabular-nums; }
    .flsvg { width: 100%; max-width: 420px; display: block; margin: 0 auto; overflow: visible; }
    .flsvg .fv { fill: var(--primary-text-color); font-size: 13px; font-weight: 800; font-variant-numeric: tabular-nums; }
    .flsvg .ft { fill: var(--secondary-text-color); font-size: 11.5px; font-weight: 700; }
    .flsvg .fb { fill: rgba(128,128,128,.06); stroke: var(--c); stroke-width: 2; opacity: .45; transition: all .4s; }
    .flsvg .fg { fill: none; stroke: var(--c); stroke-width: 6; opacity: 0; filter: blur(4px); transition: opacity .4s; }
    .flsvg .fn.act .fg { opacity: .35; }
    .flsvg .fs2 { fill: var(--secondary-text-color); font-size: 11px; }
    .flsvg .fhs { fill: var(--primary-text-color); font-size: 10.5px; font-weight: 800; }
    .flsvg .fsoc { fill: var(--primary-text-color); font-size: 10.5px; font-weight: 800; }
    .flsvg .fn.act .fb { opacity: 1; fill: color-mix(in srgb, var(--c) 16%, transparent); }
    .flsvg .fn.act .ft { fill: var(--c); }
    .flsvg .fhub { fill: rgba(128,128,128,.1); stroke: var(--divider-color); stroke-width: 2; }
    .flsvg .fhi { fill: var(--secondary-text-color); font-size: 18px; }
    .flsvg .flb { stroke-width: 2; opacity: .18; }
    .flsvg .fl { stroke-width: 4; stroke-linecap: round; stroke-dasharray: 0 13; animation: flmove 1.2s linear infinite; }
    .flsvg .fl.rev { animation-direction: reverse; }
    @keyframes flmove { to { stroke-dashoffset: -13; } }
    .lgs { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; margin-top: 10px; font-size: .82rem; }
    .lgh { display: flex; justify-content: space-between; border-bottom: 1px solid var(--divider-color); padding-bottom: 3px; }
    .lgi { display: flex; justify-content: space-between; gap: 6px; padding: 4px 0; border-bottom: 1px solid var(--divider-color); font-variant-numeric: tabular-nums; }
    .lgi span { display: flex; align-items: center; gap: 6px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .lgi i { width: 8px; height: 8px; border-radius: 50%; flex: none; }
    .foot { margin-top: 14px; text-align: center; font-size: .78rem; color: var(--secondary-text-color); }
    .foot.err { color: var(--error-color, #ef4444); }
    @media (prefers-reduced-motion: reduce) { .hdot.chg, .flsvg .fl { animation: none; } .flsvg .fl { stroke-dasharray: none; opacity: .7; } }
    /* compact view */
    ha-card.cmp { padding: 14px 16px 6px; }
    .ch { display: grid; grid-template-columns: 1fr auto; align-items: center; column-gap: 12px; }
    .cs { display: flex; align-items: center; gap: 8px; min-width: 0; font-weight: 700; font-size: 1rem; }
    .cst { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .cpw.two { grid-row: span 2; }
    .cpw { font-size: 2.15rem; font-weight: 800; line-height: 1; letter-spacing: -.02em; font-variant-numeric: tabular-nums; text-align: right; }
    .cpw small { font-size: .95rem; font-weight: 700; color: var(--secondary-text-color); margin-left: 3px; letter-spacing: 0; }
    .csub { display: flex; flex-wrap: wrap; gap: 2px 12px; margin: 3px 0 0 20px; color: var(--secondary-text-color); font-size: .82rem; font-variant-numeric: tabular-nums; }
    .rail { margin-top: 12px; }
    .rbar { position: relative; display: flex; gap: 2px; height: 6px; border-radius: 3px; overflow: hidden; background: rgba(128,128,128,.16); }
    .rbar i { display: block; min-width: 3px; transition: flex .6s; }
    .rbar.live::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, transparent 0, rgba(255,255,255,.55) 50%, transparent 100%); width: 40%; animation: rsheen 2.4s ease-in-out infinite; }
    @keyframes rsheen { from { transform: translateX(-100%); } to { transform: translateX(250%); } }
    .rtx { display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-top: 6px; font-size: .8rem; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
    .rsrc { display: flex; flex-wrap: wrap; gap: 2px 12px; min-width: 0; }
    .rsrc span { display: inline-flex; align-items: center; gap: 5px; white-space: nowrap; }
    .rsrc i { width: 7px; height: 7px; border-radius: 50%; }
    .pills { display: flex; gap: 6px; flex: none; }
    .pill { padding: 2px 8px; border-radius: 999px; font-weight: 700; font-size: .75rem; white-space: nowrap; color: var(--pc); background: color-mix(in srgb, var(--pc) 14%, transparent); }
    .cact { display: grid; grid-template-columns: 1fr auto; gap: 10px; margin-top: 14px; }
    .cbtn { position: relative; height: 52px; border: 0; border-radius: 14px; font: inherit; font-size: 1.1rem; font-weight: 800; letter-spacing: .08em; cursor: pointer; touch-action: manipulation; transition: background .25s, transform .1s; }
    .cbtn:active:not(:disabled) { transform: scale(.98); }
    .cbtn.start { background: var(--dab-green); color: #04150f; }
    .cbtn.stop { background: var(--dab-red); color: #1a0505; }
    .camp { display: grid; grid-template-columns: 40px auto 40px; align-items: center; height: 52px; border-radius: 14px; border: 1px solid var(--divider-color); overflow: hidden; }
    .camp button { height: 100%; border: 0; background: none; color: var(--primary-text-color); font-size: 1.4rem; cursor: pointer; touch-action: manipulation; }
    .camp button:active:not(:disabled) { background: rgba(128,128,128,.14); }
    .cav { display: flex; flex-direction: column; align-items: center; min-width: 44px; line-height: 1.05; }
    .cav b { font-size: 1.25rem; font-weight: 800; font-variant-numeric: tabular-nums; }
    .cav b small { font-size: .75rem; color: var(--secondary-text-color); margin-left: 1px; }
    .cav span { font-size: .68rem; color: var(--secondary-text-color); }
    .camp.dirty b { color: var(--dab-accent); }
    .cseg { margin-top: 10px; padding: 3px; gap: 3px; }
    .cseg button { min-height: 38px; font-size: .85rem; }
    .cmore { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; margin-top: 6px; padding: 8px 0; border: 0; background: none; color: var(--secondary-text-color); font: inherit; font-size: .82rem; font-weight: 600; cursor: pointer; }
    .chev { width: 7px; height: 7px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: translateY(-2px) rotate(45deg); transition: transform .2s; }
    .chev.up { transform: translateY(2px) rotate(-135deg); }
    .cdet .sec:first-child { margin-top: 4px; }
    .cdet { padding-bottom: 8px; }
    button:focus-visible, input:focus-visible { outline: 2px solid var(--dab-accent); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) { .rbar.live::after { animation: none; display: none; } }
    @media (max-width: 420px) { .hpow { font-size: 2.3rem; } ha-card { padding: 14px; } .st b { font-size: 1rem; } }
  `;var nt=class extends z{constructor(){super(...arguments);this._label=t=>["device_id","title","view","show_band","show_flow","show_stats","show_limits","flow_view"].includes(t.name)?this.t(t.name==="device_id"?"device":t.name):`${t.name} (${J[t.name]?.join(".")??""})`}setConfig(t){this._config=t}t(t){let s=xt(this.hass);return rt[s][t]??rt.en[t]??t}get _schema(){return[{name:"device_id",selector:{device:{integration:"dabstracter"}}},{name:"title",selector:{text:{}}},{name:"view",selector:{select:{mode:"list",options:[{value:"compact",label:this.t("compact")},{value:"full",label:this.t("full")}]}}},{type:"grid",name:"",schema:[{name:"show_limits",selector:{boolean:{}}},{name:"show_band",selector:{boolean:{}}},{name:"show_stats",selector:{boolean:{}}},{name:"show_flow",selector:{boolean:{}}}]},{name:"flow_view",selector:{select:{mode:"dropdown",options:[{value:"bar",label:this.t("bar")},{value:"diagram",label:this.t("diagram")}]}}},{type:"expandable",name:"entities",title:this.t("entities"),schema:Object.keys(J).map(t=>({name:t,selector:{entity:{domain:J[t][0]}}}))}]}render(){if(!this.hass||!this._config)return c;let t={view:"compact",show_band:!0,show_flow:!0,show_stats:!0,show_limits:!0,flow_view:"bar",...this._config};return d`<ha-form .hass=${this.hass} .data=${t} .schema=${this._schema} .computeLabel=${this._label}
      @value-changed=${this._changed}></ha-form>`}_changed(t){let s={...t.detail.value};if(s.entities){let i=Object.fromEntries(Object.entries(s.entities).filter(([,n])=>!!n));Object.keys(i).length?s.entities=i:delete s.entities}s.title||delete s.title,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:s},bubbles:!0,composed:!0}))}};nt.properties={hass:{attribute:!1},_config:{state:!0}};customElements.get("dabstracter-charger-card")||customElements.define("dabstracter-charger-card",G);customElements.get("dabstracter-charger-card-editor")||customElements.define("dabstracter-charger-card-editor",nt);window.customCards=window.customCards||[];window.customCards.some(r=>r.type==="dabstracter-charger-card")||window.customCards.push({type:"dabstracter-charger-card",name:"DABSTRACTER charger",description:"START / STOP, mode, current, limit, target time, discount band and energy flow for the DABSTRACTER EVSE",preview:!0,documentationURL:"https://github.com/dabstracter/dabstracter-evse-ha"});console.info(`%c DABSTRACTER-CHARGER-CARD %c ${ae} `,"background:#10b981;color:#04150f;font-weight:700","");export{de as resolveEntities};
/*! Bundled license information:

@lit/reactive-element/css-tag.js:
  (**
   * @license
   * Copyright 2019 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

@lit/reactive-element/reactive-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/lit-html.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-element/lit-element.js:
  (**
   * @license
   * Copyright 2017 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)

lit-html/is-server.js:
  (**
   * @license
   * Copyright 2022 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
