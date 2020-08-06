const fs = require('fs-extra');
const moment = require('moment');

(async function() {
    const messagesPath = `${__dirname}/../data/messages.json`;
    const messages = await fs.readJson( messagesPath ) || {};
    const conversations = messages.conversations || [];

    // Get the calls
    let namesMap = {};
    let calls = null;
    for ( let conversation of conversations ) {
        const { id, MessageList, displayName } = conversation;
        if ( id.indexOf('calllogs') !== -1 ) {
            calls = MessageList;
        }

        // Save name
        namesMap[id] = displayName;
    }

    if ( !calls ) throw new Error('No conversation found with calllogs in its id');

    calls.forEach(call => {
        const { properties } = call;
        const { 'call-log': logString } = properties;
        const { startTime, endTime, originator, target, callState } = JSON.parse( logString );

        if ( callState === 'accepted' ) {
            const start = moment( startTime );
            const end = moment( endTime );
            const difference = end.diff( start );
            const duration = moment.duration( difference, 'ms' );
            const caller = namesMap[originator] || 'Ian Wijma';
            const calTarget = namesMap[target] || 'Ian Wijma';

            console.log( `${caller} > ${calTarget} for ${duration.humanize()} (${start.format('LLL')} - ${end.format('LLL')})` );
        }
    });
})();