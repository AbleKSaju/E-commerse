const { log } = require("debug/src/node");

function hello(arr){
    
    for(i=0;i<arr.length;i++){
        var count=0
        for(j=i+1;j<arr.length;j++){
            if(arr[i]==arr[j]){
                count++
            }
        }
        if(count==1){
            console.log(arr[i]);
        }
    }
}
hello([1,1,0,0,1,2,3,3,9,0,1,10,0,1])