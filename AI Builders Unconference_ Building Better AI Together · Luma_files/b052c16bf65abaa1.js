;!function(){try { var e="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof global?global:"undefined"!=typeof window?window:"undefined"!=typeof self?self:{},n=(new e.Error).stack;n&&((e._debugIds|| (e._debugIds={}))[n]="e15d9f41-8d94-74cb-75a9-e7e36facca05")}catch(e){}}();
(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,72326,e=>{"use strict";var t=e.i(498076),n=e.i(581455),i=e.i(348688);let r=async e=>{let{initialToken:r}=e;return new t.Centrifuge(n.config.CENTRIFUGO_URL,{token:r,getToken:async()=>{let{user:e}=await i.APIClient.get("/user");return e.centrifugo_user_token}})};e.s(["createCentrifugeConnection",0,r])}]);

//# debugId=e15d9f41-8d94-74cb-75a9-e7e36facca05
//# sourceMappingURL=de9032b7e8f77e0a.js.map