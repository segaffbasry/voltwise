// Single source for the private-demo analytics snippet. The key can be overridden with NEXT_PUBLIC_POSTHOG_KEY;
// the literal fallback keeps Vercel working without dashboard setup. Surveys are disabled so nothing visible is ever added.
const key = process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "phc_xs8gTJxVhhYC39XqJ4GYgAs5Q77XYCupcJNPhd4FYqRa";

const loader = `!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags on onFeatureFlags onSessionId identify setPersonProperties group reset get_distinct_id get_session_id set_config startSessionRecording stopSessionRecording captureException".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);`;

export const posthogSnippet = `${loader}
posthog.init(${JSON.stringify(key)},{api_host:"https://eu.i.posthog.com",defaults:"2026-05-30",capture_pageview:true,capture_pageleave:true,autocapture:true,disable_session_recording:false,disable_surveys:true});
posthog.register({site:window.location.hostname});
(function(){
  var query=new URLSearchParams(window.location.search),utm={};
  ["utm_source","utm_medium","utm_campaign"].forEach(function(name){var value=query.get(name);if(value)utm[name]=value;});
  if(Object.keys(utm).length)posthog.register(utm);
  var fired={},marks=[25,50,75,100];
  function check(){
    var doc=document.documentElement,scrollable=doc.scrollHeight-window.innerHeight;
    var percent=scrollable<=0?100:((window.scrollY||doc.scrollTop)/scrollable)*100;
    marks.forEach(function(mark){
      if(!fired[mark]&&percent>=mark-(mark===100?1:0)){fired[mark]=true;posthog.capture("scroll_depth",{percent:mark,site:window.location.hostname});}
    });
  }
  window.addEventListener("scroll",check,{passive:true});
})();`;
