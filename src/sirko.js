import Client from './sirko/client';

let sirko = window.sirko;

// Makes a request to the engine once the script gets loaded.
if (sirko) {
  Client.predict(sirko.s.engineUrl, sirko.r);
}
