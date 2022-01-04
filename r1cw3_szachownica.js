let size = 8;
let tablica = "";

for (let y = 0; y<size; y++){
    for (let x = 0; x<size; x++){
        if ((x+y)%2==0){
            tablica += " ";
        } else {
            tablica += "#";
        }
    }
    tablica += "\n";
}
console.log(tablica);