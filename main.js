/* Einstiegspunkt: Routen registrieren, Shell starten. */
import { route, start } from './core/router.js';
import * as store from './core/store.js';
import { init } from './shell/shell.js';
import * as V from './shell/views.js';

route(/^\/dashboard$/, V.dashboard);
route(/^\/modules$/, V.modules);
route(/^\/favorites$/, V.favorites);
route(/^\/recent$/, V.recent);
route(/^\/settings$/, V.settings);
route(/^\/m\/([\w-]+)$/, V.modulePage);

init();
start();
store.open().catch(() => { document.getElementById('banner').hidden = false; });

const boot = document.getElementById('boot');
boot.classList.add('done');
setTimeout(() => boot.remove(), 600);
