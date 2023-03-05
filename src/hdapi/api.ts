// import { ConnectionOptions, open, Protocol, RecvEvent } from 'node-node-simconnect';
//
// const EVENT_ID_PAUSE = 1;
// const options: ConnectionOptions = {
//     remote: {
//     host: 'localhost',
//         port: 5111
//     }
// };
//
// open('My SimConnect client', Protocol.KittyHawk, options)
//     .then(({ recvOpen, handle }) => {
//         // recvOpen: object containing simulator information
//         // handle: the SimConnect handle
//         console.log('Connected to', recvOpen.applicationName);
//         handle.subscribeToSystemEvent(EVENT_ID_PAUSE, 'Pause');
//         handle.on('event', (recvEvent: RecvEvent) => {
//             switch (recvEvent.clientEventId) {
//                 case EVENT_ID_PAUSE:
//                     console.log(recvEvent.data === 1 ? 'Sim paused' : 'Sim unpaused');
//                     break;
//             }
//         });
//         handle.on('exception', function (recvException) {
//             console.log(recvException);
//         });
//         handle.on('quit', function () {
//             console.log('Simulator quit');
//         });
//         handle.on('close', function () {
//             console.log('Connection closed unexpectedly (simulator CTD?)');
//         });
//     })
//     .catch(error => {
//         console.log(`Connection failed: ${error}`);
//     });
