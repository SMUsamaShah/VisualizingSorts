// rescale a number from old range to new range
function rescale(number, old_min, old_max, new_min, new_max) {
    const ratio = (number - old_min) / (old_max - old_min);
    return new_min + (ratio * (new_max - new_min));
}

function swap(array, i, j) {
    if (i >= array.length || j >= array.length || i === j)
        return;

    let t = array[i];
    array[i] = array[j];
    array[j] = t;
}

function shuffle(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}