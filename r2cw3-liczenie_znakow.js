

function countChar(string, char) {
    let counter = 0;
    for(let i=0; i<string.length; i++){
        if (string[i] == char) {
            counter += 1;
        }
    } 
    return counter;
}

function countBs(string) {
    return countChar(string, "B");
  }

console.log(countBs("BolesławBB"));