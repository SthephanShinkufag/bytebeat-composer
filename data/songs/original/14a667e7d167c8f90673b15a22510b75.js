return function(t) {
    t *= 1000;
    let lfsr = 0b11111;
    let o = [];

    for (let _ = 0; _ < 32; _++) {
        const bit = (lfsr & 1) ^ ((lfsr >> 1) & 1);
        lfsr = (lfsr >> 1) | (bit << 4);
        o.push(lfsr & 1);
    }
    const atari_thingy = 2 + ((t >> 7 & 7) % 3);
    return o[int(t * atari_thingy) % o.length];
}