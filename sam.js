const { log } = require("debug/src/browser");

var ab=[1,1,1,4,5,6,5,4,3,2]

function hello(a){
var n=[]
    for(let i=0;i<a.length;i++){
        var k=0
    for(let j=i+1;j<a.length;j++){
        if(a[i]==a[j]){
            k=k+1
        }    
    }
    if(k==1){
        n.push(a[i]);
    }
}
console.log(n);
}
hello(ab)
