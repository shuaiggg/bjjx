function toChannel(channel) {
    return channel || '';
}

export default function (myChannel, targetChannel) {
    myChannel = toChannel(myChannel);
    if (myChannel === toChannel(targetChannel)) {
        return true;
    }
    if (myChannel === 'chat' && !targetChannel) {
        return true;
    }
    if (!myChannel && targetChannel === 'chat') {
        return true;
    }
};

