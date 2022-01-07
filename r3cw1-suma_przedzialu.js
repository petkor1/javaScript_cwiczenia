function range(start, end, step = start < end ? 1:-1) {
    let tablica = [];

    if (step > 0) {
        for (let i = start; i <= end; i += step) tablica.push(i);
    }
    else {
        for (let i = start; i >= end; i+=step) tablica.push(i);
         
    }return tablica;
}

function sum(array){
    let summary = 0;
    for (let value of array){
        summary += value;
    }
    return summary;
}

console.log(sum(range(1,10)));