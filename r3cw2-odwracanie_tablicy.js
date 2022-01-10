function reverseArray(array){
    let newArray = [];
    for (let value of array){
        newArray.unshift(value);
    }return newArray;
}
console.log(reverseArray(["test",2,3,4,5]));

