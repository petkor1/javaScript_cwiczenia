function isEven (n) {
    result = "";
    if (n == 0) return result += "parzysta";
    else if (n == 1) return result += "nieparzysta";
    else if (n < 0) return isEven(-n);
    else return isEven(n-2);
}

console.log(isEven(99));