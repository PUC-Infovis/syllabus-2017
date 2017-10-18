
// Devuelve un entero pseudoaleatorio entre [min, max).
const getRandint = (max, min = 0) =>
    Math.floor(Math.random() * (max - min)) + min;

// Devuelve un elemento al pseudoazar desde un arreglo.
const getRanditem = array => array[getRandint(array.length)];

const fetchData = (dataset = undefined, changes = {
    enter: 0,
    update: 0,
    exit: 0
}) => {
    const jsonData = d3.json('dataset.json');
    if (dataset == undefined) return jsonData;

    // Exit.
    Array(changes.exit).fill(0).forEach(() => {
        // Elimina el último elemento.
        // if (dataset.length) dataset.pop();

        // Elimina el primer elemento.
        // if (dataset.length) dataset.splice(0, 1);

        // Elimina posiciones aleatorias.
        if (dataset.length) dataset.splice(getRandint(dataset.length), 1);
    });

    // Update.
    Array(changes.update).fill(0).forEach(() => {
        const randomItem = getRanditem(dataset);
        if (dataset.length) {
            randomItem.gscholar += 5000;  // Más citas.
            // randomItem.ns1 += 50;      // Más alumnes.
        }
        // if (dataset.length) {
        //     randomItem.gscholar += 15000; // Llegó el paper mágico.
        // }
    });

    // Enter.
    Array(changes.enter).fill(0).forEach(() => {
        dataset.push({
            firstname: getRanditem(FIRST_NAMES),
            lastname: getRanditem(LAST_NAMES),
            age: getRandint(30, 75),
            ns1: getRandint(120),
            ns2: getRandint(120),
            gscholar: getRandint(3000),
        });
    });

    return jsonData.response(() => dataset);
};
